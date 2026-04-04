import subprocess

def merge_and_push(branch="claude/review-project-structure-plLmY"):
    commands = [
        ["git", "fetch", "origin", branch],
        ["git", "merge", "origin/" + branch, "--no-edit"],
        ["git", "push", "origin", "main"],
    ]
    for cmd in commands:
        print(f"Running: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return False
        print(result.stdout)
    print("Done! Merged and pushed to main.")
    return True

merge_and_push()
