# Followup

Implement each of these fixes one by one as commits in a new branch to integrate to mvp with name fixtures. Before we commit anything or move on to next fix, let me analyze and evaluate whether the fix/change has been done.

1. For simulation 1 change the body size over time for a histogram. Add a plot series for current and one that saves starting snapshot, showing at the same time for comparison.   
2. On simulation 2, organisms are displayed in color orange only. And there is nothing being plotted in population by color plot  
   1. Same for bonus reproductions, nothing shows at bonus reproductions plot. May be a problem with counting lizard by color  
3. Lets implement a preset system so I can save determined presets user can choose from. Add this preset sections after simulation level choose. Filter dropdown based on related type of simulation level  
   1. Add in this section as well an input so user can choose to see simulation, this seed must also be part of the preset  
4. Fix this flakey test if possible, and/or add retries  
   1. AIL  tests/level2/Level2Simulation.test.ts \> Level2Simulation — RPS mechanics \> over 100 ticks dominant color changes — validates RPS cycle  
5. Lets guard all simulation levels with max population and extinction guard. So lets add this functionality in base SimulationLevel class.  
   1. This would let us abstract guard computation, and addLizards method (during reproduction \+ addons) at base level for consistent non-repeated behavior
6. Add css variable to whole app container so overflow is hidden/clipped


# Questions:

1. What is the meaning behind compute reproduction probability, how does current mechanism work?