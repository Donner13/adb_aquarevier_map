import os
import re
import subprocess
import sys
import time

vault_root = r"G:\Meine Ablage\Antigravity"
backlog_path = os.path.join(vault_root, "10_Projects", "Aquarevier_Map_Backlog.md")
repo_dir = r"C:\Users\user\.gemini\antigravity-ide\scratch\contact_map"
sonu_cli_path = r"C:\Users\user\sonu-cli-advanced\main.py"

def run_delegation(limit=5):
    if not os.path.exists(backlog_path):
        print(f"Backlog file not found: {backlog_path}")
        return
        
    print("Reading backlog...")
    with open(backlog_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Find all proposal items in Runde 1 and Runde 2 that are not implemented yet.
    # Impressum is already marked as done.
    # Let's search for headings like "## Runde X - Y. Title" and extract details.
    pattern = r"##\s+Runde\s+(\d+)\s+-\s+(\d+)\.\s+([^\n]+?)(?:\s*\(ERLEDIGT\))?\n\*\*Kategorie:\*\*\s*(.*?)\n\*\*Mehrwert:\*\*\s*(.*?)\n\*\*Technischer Ansatz:\*\*\s*(.*?)(?=\n##\s+Runde|\Z)"
    matches = re.findall(pattern, content, re.DOTALL)
    
    open_proposals = []
    for r_num, p_num, title, category, rationale, approach in matches:
        r_num = int(r_num)
        p_num = int(p_num)
        
        # Skip Impressum & Datenschutz (Runde 2, Nr. 5)
        if r_num == 2 and p_num == 5:
            continue
            
        open_proposals.append({
            "round": r_num,
            "num": p_num,
            "title": title.strip(),
            "category": category.strip(),
            "rationale": rationale.strip(),
            "approach": approach.strip()
        })
        
    print(f"Found {len(open_proposals)} open proposals in backlog.")
    
    count = 0
    for prop in open_proposals:
        if count >= limit:
            break
            
        print("\n" + "="*50)
        print(f"Implementing: Runde {prop['round']} - Nr. {prop['num']}: {prop['title']}")
        print(f"Category: {prop['category']}")
        print(f"Approach: {prop['approach']}")
        print("="*50)
        
        prompt = (
            f"Task: Implement the following feature in the AquaRevier Map repository at {repo_dir}.\n\n"
            f"Feature Title: {prop['title']}\n"
            f"Category: {prop['category']}\n"
            f"Rationale: {prop['rationale']}\n"
            f"Proposed Approach:\n{prop['approach']}\n\n"
            f"Guidelines:\n"
            f"1. Make the changes to index.html and internal.html to show this feature.\n"
            f"2. Write any helper Python scripts or scrape joins in the repository if necessary.\n"
            f"3. Run check_html.py and verify JS syntax to ensure there are no syntax errors.\n"
            f"4. Once implemented and verified, commit the changes to git with a descriptive commit message starting with 'feat: '.\n"
        )
        
        # Execute Sonu CLI
        cmd = [sys.executable, sonu_cli_path, "-p", prompt]
        print(f"Launching Sonu: {' '.join(cmd)}")
        
        start_time = time.time()
        res = subprocess.run(cmd, cwd=repo_dir)
        elapsed = time.time() - start_time
        
        print(f"Sonu execution finished in {elapsed:.1f}s with exit code {res.returncode}")
        
        # Mark as done in the backlog file
        if res.returncode == 0:
            print("Successfully implemented, updating backlog status...")
            # Reload backlog and replace title with (ERLEDIGT)
            with open(backlog_path, "r", encoding="utf-8") as f_back:
                b_content = f_back.read()
                
            target_title = f"## Runde {prop['round']} - {prop['num']}. {prop['title']}"
            if target_title in b_content:
                b_content = b_content.replace(target_title, target_title + " (ERLEDIGT)")
                with open(backlog_path, "w", encoding="utf-8") as f_back_w:
                    f_back_w.write(b_content)
                print("Backlog updated.")
                
            # Run index builder
            subprocess.run([sys.executable, os.path.join(vault_root, "_system", "build_index.py")], cwd=vault_root)
        else:
            print("Sonu execution failed. Skipping marking as done.")
            
        count += 1
        
    print("\nDelegation run completed!")

if __name__ == "__main__":
    limit = 2
    if len(sys.argv) > 1:
        try:
            limit = int(sys.argv[1])
        except ValueError:
            pass
    run_delegation(limit)
