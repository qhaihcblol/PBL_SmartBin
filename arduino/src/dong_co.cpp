#include <Arduino.h>
#include <dong_co.h>

void SetupMotor(int tepPin, int dirPin, int enaPin)
{

    pinMode(tepPin, OUTPUT);
    pinMode(dirPin, OUTPUT);
    pinMode(enaPin, OUTPUT);

    digitalWrite(enaPin, LOW); // Set Enable LOW - khởi động motor
}

void LoopMotor(int tepPin, int dirPin, int enaPin, int steps, int direction, int speed)
{

    digitalWrite(dirPin, direction ? HIGH : LOW); // Set chiều quay của motor

    for (int i = 0; i < steps; i++)
    {
        digitalWrite(tepPin, HIGH);
        delayMicroseconds(speed);
        digitalWrite(tepPin, LOW);
        delayMicroseconds(speed);
    }
}
