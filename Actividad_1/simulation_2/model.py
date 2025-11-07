from mesa import Model
from mesa.discrete_space import OrthogonalMooreGrid
from .agent import Cell
import random
import time

class ConwaysGameOfLife(Model):
    def __init__(self, width=50, height=50, initial_fraction_alive=0.2, seed=None):
        if seed is None:
            seed = int(time.time() * 1000) % 1000000 
        
        super().__init__(seed=seed)

        self.grid = OrthogonalMooreGrid((width, height), capacity=1, torus=True)

        for cell in self.grid.all_cells:
            init_state = (
                Cell.ALIVE
                if random.random() < initial_fraction_alive
                else Cell.DEAD
            )
            
            Cell(self, cell, init_state=init_state)

        self.running = True

    def step(self):
        self.agents.do("determine_state")
        self.agents.do("assume_state")