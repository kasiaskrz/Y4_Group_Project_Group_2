# Y4_Group_Project_Group_2
Group project for our computing module. We’re building a game with a companion website.

TEAM MEMBERS
- Saule Satkute Small
- Cillian Walsh
- Katarzyna Skrzynska

REPOSITORY PURPOSE

This repo will store both the website and game files, including code, assets, and documentation.

🌿 Git & GitHub Team Workflow Guide

This file explains how our team will collaborate safely and efficiently using Git and GitHub.  
Follow these steps whenever you work on the project to avoid overwriting each other’s code. 


🏁 1. Clone the Project (First Time Only)

```bash
git clone https://github.com/your-team/project-name.git
cd project-name
```

🌱 2. Create Your Own Branch

Whenever you start a new feature or fix:

```bash
git checkout -b your-branch-name
```

Example:
```bash
git checkout -b katarzyna-navbar
```

✅ This creates a **new branch** and switches you to it.

💾 3. Add and Commit Your Changes

After editing your files:

```bash
git add .
git commit -m "added navbar layout"
```

💡 Keep commit messages short but clear — describe *what* you did.

---

⬆️ 4. Push Your Branch to GitHub

Send your branch to GitHub so everyone can see your work:

```bash
git push origin your-branch-name
```

Example:
```bash
git push origin katarzyna-navbar
```

🔁 5. Create a Pull Request (PR)

1. Go to **GitHub → your repo**.  
2. You’ll see a message like:  
   > “You just pushed a branch! Create a pull request.”  
3. Click **Compare & pull request**.  
4. Describe what you changed.  
5. Click **Create pull request**.

This lets teammates review before merging it into the `main` branch.

👯 6. Merge Your Branch

Once everyone’s happy and the code works:
- Click **“Merge Pull Request”** on GitHub.  
- Then delete the branch if it’s no longer needed.

Now your changes are part of the main project 🎉

🔄 7. Update Your Local Copy Regularly

Before starting new work or creating a new branch:

```bash
git checkout main
git pull
```

Then, for a new feature:
```bash
git checkout -b new-feature-name
```

This keeps your local version updated with everyone’s changes.

⚠️ Common Mistakes to Avoid

- Don’t code directly on `main`. Always use your own branch.  
- Always **pull before you push**.  
- If you get a merge conflict, talk to your teammates before fixing it.  
- Don’t forget to commit your work often — small commits are better than one giant one!

🧹 Bonus Tip: Clean Up Old Branches

After merging and confirming everything works:

```bash
git branch -d branch-name
```

Keeps your repo clean and organized 🌸

💬 Quick Example Workflow

```bash
git checkout -b kasia-navbar
# edit files...
git add .
git commit -m "added navbar layout"
git push origin kasia-navbar
# create pull request on GitHub
```
