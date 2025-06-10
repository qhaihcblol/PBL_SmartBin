#ifndef LCD_DISPLAY_H
#define LCD_DISPLAY_H

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

void SetupLCD();
void ShowMessage(String msg);

#endif
