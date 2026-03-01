# Followup

Implement each of these fixes one by one as commits in a new branch to integrate to mvp with name fixtures. Before we commit anything or move on to next fix, let me analyze and evaluate whether the fix/change has been done.

1. Reproduction addon is rerolling reproduction. I need it to be included in simulation reproduction roll itself. Do not roll twice  
2. Make panel sections drag-resizable  
3. Add an export button to download a json with current param settings (so it can be added to presets eventually)

# Questions:

1. Recommendations on choosing correct parameters \+ seed to ensure desired level2 oscillating behavior. How else can we ensure this happens?  
   1. Think theoretical  
   2. Other option is creating a script that runs several simulations with params \+ seed and outputs matching params