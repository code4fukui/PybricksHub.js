from pybricks.hubs import PrimeHub
from pybricks.pupdevices import Motor, ColorSensor, UltrasonicSensor, ForceSensor
from pybricks.parameters import Button, Color, Direction, Port, Side, Stop
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch

motor1 = Motor(Port.A)
motor2 = Motor(Port.B)
eyes = UltrasonicSensor(Port.E)

while True:
    motor1.run(-300)
    motor2.run(300)
    while eyes.distance() > 100:
        pass
    motor1.stop()
    motor2.stop()
    wait(500)
    motor1.run(300)
    motor2.run(300)
    wait(500)
