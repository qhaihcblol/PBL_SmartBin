#include "lcd.h"

LiquidCrystal_I2C lcd(0x27, 16, 2); // Địa chỉ LCD phổ biến là 0x27

void SetupLCD()
{
    lcd.init();      // Khởi tạo LCD
    lcd.backlight(); // Bật đèn nền
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Waiting BEGIN...");
}

void ShowMessage(String msg)
{
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Detected:");
    lcd.setCursor(0, 1);
    lcd.print(msg);
}
