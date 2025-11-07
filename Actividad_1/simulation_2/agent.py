# FixedAgent: Immobile agents permanently fixed to cells
from mesa.discrete_space import FixedAgent

class Cell(FixedAgent):
    """Represents a single ALIVE or DEAD cell in the simulation."""

    DEAD = 0
    ALIVE = 1

    @property
    def x(self):
        return self.cell.coordinate[0]

    @property
    def y(self):
        return self.cell.coordinate[1]

    @property
    def is_alive(self):
        return self.state == self.ALIVE

    @property
    def neighbors(self):
        return self.cell.neighborhood.agents
    
    def __init__(self, model, cell, init_state=DEAD):
        """Create a cell, in the given state, at the given x, y position."""
        super().__init__(model)
        self.cell = cell
        self.pos = cell.coordinate
        self.state = init_state
        self._next_state = None

    def determine_state(self):
        x = self.x
        y = self.y
        width = self.model.grid.dimensions[0]
        height = self.model.grid.dimensions[1]
        
        y_above = (y + 1) % height 
        
        left_x = (x - 1) % width
        center_x = x
        right_x = (x + 1) % width
        
        left_state = 0
        center_state = 0
        right_state = 0
        
        for agent in self.model.agents:
            if agent.y == y_above:
                if agent.x == left_x:
                    left_state = agent.state
                elif agent.x == center_x:
                    center_state = agent.state
                elif agent.x == right_x:
                    right_state = agent.state
        
        pattern = left_state * 4 + center_state * 2 + right_state * 1
        
        if pattern == 7:  # 111
            self._next_state = self.DEAD
        elif pattern == 6:  # 110
            self._next_state = self.ALIVE
        elif pattern == 5:  # 101
            self._next_state = self.DEAD
        elif pattern == 4:  # 100
            self._next_state = self.ALIVE
        elif pattern == 3:  # 011
            self._next_state = self.ALIVE
        elif pattern == 2:  # 010
            self._next_state = self.DEAD
        elif pattern == 1:  # 001
            self._next_state = self.ALIVE
        else:  # 000
            self._next_state = self.DEAD

    def assume_state(self):
        self.state = self._next_state