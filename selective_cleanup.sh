#\!/bin/bash

echo "Creating selective history cleanup..."

# Get all commit hashes in chronological order (newest first)
git log --oneline --format="%h" > all_commits.txt

# Calculate total commits
total_commits=$(wc -l < all_commits.txt)
echo "Total commits: $total_commits"

# Create list of commits to keep (keep 2 out of every 5, delete 3 out of every 5)
echo "Selecting commits to keep (2 out of every 5)..."

# Keep commits: positions 1,2 of every group of 5, skip 3,4,5
awk 'NR % 5 == 1 || NR % 5 == 2' all_commits.txt > commits_to_keep.txt

# Count commits to keep
keep_count=$(wc -l < commits_to_keep.txt)
echo "Will keep $keep_count commits ($(echo "scale=1; $keep_count * 100 / $total_commits" | bc -l 2>/dev/null || echo "~40")%)"

echo "Starting interactive rebase..."

# Create the rebase todo list
{
    while read commit; do
        if grep -q "^$commit$" commits_to_keep.txt; then
            echo "pick $commit"
        else
            echo "drop $commit"
        fi
    done < all_commits.txt
} > rebase_todo.txt

# Show what we're about to do
echo "First 10 operations:"
head -10 rebase_todo.txt

echo ""
echo "This will:"
echo "- Keep $(grep -c "^pick" rebase_todo.txt) commits" 
echo "- Drop $(grep -c "^drop" rebase_todo.txt) commits"

# Cleanup
rm all_commits.txt commits_to_keep.txt rebase_todo.txt

echo ""
echo "Ready to proceed with manual rebase. Run:"
echo "git rebase -i --root"
echo "Then change 'pick' to 'drop' for ~60% of commits"
EOF < /dev/null