#include <Arduino.h>
#include <distance.h>

void SetupSRC(int trigPin, int echoPin)
{
    pinMode(trigPin, OUTPUT);
    pinMode(echoPin, INPUT);
}

long ReadDistanceCM(int trigPin, int echoPin)
{
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    long duration = pulseIn(echoPin, HIGH);
    float distance = duration * 0.034 / 2;

    return distance;
}