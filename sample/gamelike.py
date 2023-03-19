from pybricks.hubs import PrimeHub
from pybricks.pupdevices import Motor, ColorSensor, UltrasonicSensor, ForceSensor
from pybricks.parameters import Button, Color, Direction, Port, Side, Stop
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch
from pybricks.geometry import Matrix
from urandom import randint

hub = PrimeHub()

field = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ]

y = 0
x = 2
n = randint(1, 3) * 30
t = StopWatch()
while True:
  btns = hub.buttons.pressed()
  if Button.LEFT in btns and x > 0 and field[y][x - 1] == 0:
    x -= 1
  if Button.RIGHT in btns and x < 4 and field[y][x + 1] == 0:
    x += 1
  hub.display.icon(field)
  hub.display.pixel(y, x, n)
  wait(100)
  if t.time() > 500:
    t.reset()
    y += 1
    if y == 5 or field[y][x] != 0:
      field[y - 1][x] = n
      y = 0
      x = 2
      n = randint(1, 3) * 30
      if field[y][x] != 0:
        break

for i in range(0, 5):
  for j in range(0, 5):
    field[4 - i][j] = 0
  hub.display.icon(field)
  wait(100)

wait(1000)
