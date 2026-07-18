import os
import re
import subprocess
import sys
import time

vault_root = r"G:\Meine Ablage\Antigravity"
backlog_path = os.path.join(vault_root, "10_Projects", "Aquarevier_Map_Backlog.md")
repo_dir = r"C:\Users\user\.gemini\antigravity-ide\scratch\contact_map"
sonu_cli_path = r"C:\Users\user\sonu-cli-advanced\main.py"

def parse_proposals_by_toc():
    if not os.path.exists(backlog_path):
        print(f"Backlog not found: {backlog_path}")
        return []
        
    with open(backlog_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Split content by Runde 1, Runde 2, Runde 3
    parts = re.split(r'#\s+Runde\s+(\d+)\s+', content)
    if len(parts) < 5:
        print("Could not split backlog by Runde 1 and 2.")
        return []
        
    r1_text = parts[2]
    r2_text = parts[4]
    
    # We will extract the 15 titles from the TOC in each round
    # TOC line pattern: "1. [Title](#link) — *Category*"
    toc_pattern = r'^\s*(\d+)\.\s+\[([^\]]+)\]\([^\)]+\)\s*—\s*\*([^*]+)\*'
    
    r1_proposals = []
    r2_proposals = []
    
    # Process Runde 1 TOC
    for line in r1_text.splitlines():
        m = re.match(toc_pattern, line)
        if m:
            num = int(m.group(1))
            title = m.group(2).strip()
            cat = m.group(3).strip()
            r1_proposals.append({"round": 1, "num": num, "title": title, "category": cat})
            
    # Process Runde 2 TOC
    for line in r2_text.splitlines():
        m = re.match(toc_pattern, line)
        if m:
            num = int(m.group(1))
            title = m.group(2).strip()
            cat = m.group(3).strip()
            r2_proposals.append({"round": 2, "num": num, "title": title, "category": cat})
            
    # For each extracted proposal, we find its full body
    def extract_body(text, num, title, next_num):
        # Escaping title for safety in regex
        escaped_title = re.escape(title)
        # Search for "## num. title" up to "## next_num. " or the end of the text
        if next_num:
            body_pattern = r'##\s+' + str(num) + r'\.\s+' + escaped_title + r'(?:\s*\(ERLEDIGT\))?\n(.*?)(?=##\s+' + str(next_num) + r'\.\s+|\Z)'
        else:
            body_pattern = r'##\s+' + str(num) + r'\.\s+' + escaped_title + r'(?:\s*\(ERLEDIGT\))?\n(.*)'
            
        m_body = re.search(body_pattern, text, re.DOTALL)
        if m_body:
            return m_body.group(1).strip()
        return "Body not found."

    print(f"Extracted {len(r1_proposals)} items from Runde 1 TOC.")
    print(f"Extracted {len(r2_proposals)} items from Runde 2 TOC.")
    
    # Populate bodies
    for i, prop in enumerate(r1_proposals):
        next_num = r1_proposals[i+1]["num"] if i+1 < len(r1_proposals) else None
        prop["body"] = extract_body(r1_text, prop["num"], prop["title"], next_num)
        
    for i, prop in enumerate(r2_proposals):
        next_num = r2_proposals[i+1]["num"] if i+1 < len(r2_proposals) else None
        prop["body"] = extract_body(r2_text, prop["num"], prop["title"], next_num)
        
    # Check completed items in TOC
    # Completed items have (ERLEDIGT) in their heading
    completed_pattern = r'##\s+(\d+)\.\s+([^\n]+?)\s*\(ERLEDIGT\)'
    completed_in_r1 = [int(n) for n, _ in re.findall(r'##\s+(\d+)\.\s+([^\n]+?)\s*\(ERLEDIGT\)', r1_text)]
    completed_in_r2 = [int(n) for n, _ in re.findall(r'##\s+(\d+)\.\s+([^\n]+?)\s*\(ERLEDIGT\)', r2_text)]
    
    open_proposals = []
    for p in r1_proposals:
        if p["num"] not in completed_in_r1:
            open_proposals.append(p)
            
    for p in r2_proposals:
        # Mark Zuständigkeit (Nr 4) and Impressum (Nr 5) as done
        if p["num"] in [4, 5] or p["num"] in completed_in_r2:
            continue
        open_proposals.append(p)
        
    return open_proposals

def run_delegation(limit=1):
    open_props = parse_proposals_by_toc()
    print(f"Found {len(open_props)} open proposals.")
    
    count = 0
    for prop in open_props:
        if count >= limit:
            break
            
        print("\n" + "="*50)
        print(f"Implementing: Runde {prop['round']} - Nr. {prop['num']}: {prop['title']}")
        print(f"Category: {prop['category']}")
        print("="*50)
        
        prompt = (
            f"Task: Implement the following feature in the AquaRevier Map repository at {repo_dir}.\n\n"
            f"Feature Title: {prop['title']}\n"
            f"Category: {prop['category']}\n"
            f"Full Detail Brief:\n{prop['body']}\n\n"
            f"Guidelines:\n"
            f"1. Make the changes to index.html and internal.html to show this feature.\n"
            f"2. Write any helper Python scripts or data conversions in the repository if necessary.\n"
            f"3. Run check_html.py and verify JS syntax to ensure there are no syntax errors.\n"
            f"4. Once implemented and verified, commit the changes to git with a descriptive commit message starting with 'feat: '.\n"
        )
        
        def safe_print(msg):
            try:
                print(msg)
            except UnicodeEncodeError:
                print(msg.encode('ascii', errors='ignore').decode('ascii'))

        # Execute Sonu CLI
        cmd = [sys.executable, sonu_cli_path, "-p", prompt]
        safe_print(f"Launching Sonu: {' '.join(cmd)}")

        sha_before = subprocess.run(["git", "rev-parse", "HEAD"], cwd=repo_dir,
                                     capture_output=True, text=True).stdout.strip()

        start_time = time.time()
        res = subprocess.run(cmd, cwd=repo_dir)
        elapsed = time.time() - start_time

        sha_after = subprocess.run(["git", "rev-parse", "HEAD"], cwd=repo_dir,
                                    capture_output=True, text=True).stdout.strip()
        commit_happened = sha_before != sha_after

        safe_print(f"Sonu execution finished in {elapsed:.1f}s with exit code {res.returncode}, new commit: {commit_happened}")

        # Mark as done in the backlog file - exit code 0 alone is not enough,
        # sonu can "succeed" without actually finishing+committing the feature
        # (seen live: wrote helper data files but never touched index.html or
        # committed). Require an actual new commit before marking ERLEDIGT.
        if res.returncode == 0 and commit_happened:
            print("Successfully implemented, updating backlog status...")
            with open(backlog_path, "r", encoding="utf-8") as f_back:
                b_content = f_back.read()
                
            # Find the section and replace title
            # Search for the heading under the right Runde
            parts = re.split(r'(#\s+Runde\s+' + str(prop['round']) + r'\s+)', b_content)
            if len(parts) >= 3:
                r_header = parts[1]
                r_body = parts[2]
                
                # Replace the heading in this specific Runde's body
                target_title = f"## {prop['num']}. {prop['title']}"
                if target_title in r_body:
                    r_body = r_body.replace(target_title, target_title + " (ERLEDIGT)", 1)
                    # Reconstruct
                    parts[2] = r_body
                    b_content = "".join(parts)
                    with open(backlog_path, "w", encoding="utf-8") as f_back_w:
                        f_back_w.write(b_content)
                    print("Backlog updated.")
            
            # Run index builder
            subprocess.run([sys.executable, os.path.join(vault_root, "_system", "build_index.py")], cwd=vault_root)
        else:
            print("Sonu did not produce a new commit (or exited non-zero). Skipping marking as done.")
            
        count += 1
        
    print("\nDelegation run completed!")

if __name__ == "__main__":
    limit = 1
    if len(sys.argv) > 1:
        try:
            limit = int(sys.argv[1])
        except ValueError:
            pass
    run_delegation(limit)
