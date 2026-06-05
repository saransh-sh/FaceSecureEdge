import os

repo_dir = "/tmp/workspace/saransh-sh/FaceSecureEdge"

files_to_replace = [
    "package.json",
    "package-lock.json",
    "app.json",
    "README.md",
    "android/settings.gradle",
    "android/app/build.gradle",
    "android/app/src/main/res/values/strings.xml",
    "android/app/src/main/java/com/anonymous/FaceAuthApp/MainApplication.kt",
    "android/app/src/main/java/com/anonymous/FaceAuthApp/MainActivity.kt"
]

for file in files_to_replace:
    filepath = os.path.join(repo_dir, file)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Replace case-sensitive
        content = content.replace("faceauthapp", "facesecureedge")
        content = content.replace("FaceAuthApp", "FaceSecureEdge")
        
        with open(filepath, 'w') as f:
            f.write(content)

# Now rename the folder
old_dir = os.path.join(repo_dir, "android/app/src/main/java/com/anonymous/FaceAuthApp")
new_dir = os.path.join(repo_dir, "android/app/src/main/java/com/anonymous/FaceSecureEdge")

if os.path.exists(old_dir):
    os.rename(old_dir, new_dir)

print("Done")
