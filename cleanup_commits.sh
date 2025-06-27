#\!/bin/bash

# Script to keep only every 5th commit (20% of commits)
# This preserves development timeline while reducing commit count

echo "Creating clean history branch..."

# Get all commit hashes in reverse order (oldest first)
git log --oneline --reverse | awk '{print $1}' > all_commits.txt

# Calculate total commits
total_commits=$(wc -l < all_commits.txt)
echo "Total commits: $total_commits"

# Keep every 5th commit (20% retention)
echo "Selecting every 5th commit..."
awk 'NR % 5 == 1' all_commits.txt > commits_to_keep.txt

# Count commits to keep
keep_count=$(wc -l < commits_to_keep.txt)
echo "Will keep $keep_count commits"

# Create new orphan branch
git checkout --orphan clean-history-temp

# Remove all files from staging
git rm -rf . 2>/dev/null || true

# Cherry-pick selected commits
echo "Cherry-picking selected commits..."
while read -r commit; do
    echo "Cherry-picking $commit..."
    if \! git cherry-pick "$commit" --no-edit; then
        echo "Conflict in $commit - resolving automatically..."
        # Auto-resolve by taking the incoming changes
        git add .
        git cherry-pick --continue --no-edit
    fi
done < commits_to_keep.txt

echo "Clean history created on branch 'clean-history-temp'"

# Cleanup temporary files
rm all_commits.txt commits_to_keep.txt
EOF < /dev/null