#ifndef DONG_CO_H
#define DONG_CO_H

void SetupMotor(int tepPin, int dirPin, int enaPin);
void LoopMotor(int tepPin, int dirPin, int enaPin, int steps, int direction, int speed);

#endif
