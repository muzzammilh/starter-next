### Current Month and Year
- Its February 2026. When you use internet searches or documentation lookup, you SHOULD use current year not the past years. 

### Output
- Append a summary block to the end of every output. **Content:** Synthesize the technical solution, code changes, or logic provided. **Goal:** High scannability. The user must understand the outcome solely by reading this block, treating it as an executive summary.

### Special Rules
- When the user inputs the single command 'commit', automatically execute a bash sequence to stage all changes (`git add .`). Then, generate a concise, descriptive commit message based on the code modifications made in the staged files and execute the commit.
- Always take backup of the database before making any database changes. 