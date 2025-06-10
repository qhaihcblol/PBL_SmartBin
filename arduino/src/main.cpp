#include <Arduino.h>
#include <distance.h>
#include <dong_co.h>
#include <lcd.h> // thư viện tự viết, chứa SetupLCD() và ShowMessage()

// Cấu hình chân động cơ
const int ENA_PIN1 = 44;
const int DIR_PIN1 = 43;
const int TEP_PIN1 = 42;

const int ENA_PIN2 = 47;
const int DIR_PIN2 = 46;
const int TEP_PIN2 = 45;

// Cảm biến siêu âm
const int TRIG_PIN = 10;
const int ECHO_PIN = 9;

bool beginReceived = false;
int flag_DC1 = 0;
String label = "";

void setup()
{
    Serial.begin(9600);
    SetupMotor(TEP_PIN1, DIR_PIN1, ENA_PIN1);
    SetupMotor(TEP_PIN2, DIR_PIN2, ENA_PIN2);
    SetupSRC(TRIG_PIN, ECHO_PIN);
    SetupLCD(); // Khởi tạo LCD
    ShowMessage("Waiting...");
}

void loop()
{
    if (!beginReceived && Serial.available())
    {
        String msg = Serial.readStringUntil('\n');
        msg.trim();
        if (msg.equalsIgnoreCase("BEGIN"))
        {
            beginReceived = true;
            ShowMessage("Ready");
            if (flag_DC1 != 1)
            {
                LoopMotor(TEP_PIN1, DIR_PIN1, ENA_PIN1, 850, 1, 500);
                flag_DC1 = 1;
            }
        }
        return;
    }

    if (beginReceived)
    {
        long distance = ReadDistanceCM(TRIG_PIN, ECHO_PIN);
        if (distance < 15)
        {
            Serial.println("DETECT");

            while (Serial.available() == 0)
            {
                delay(10);
            }

            label = Serial.readStringUntil('\n');
            label.trim();
            ShowMessage(label); // Cập nhật LCD với loại rác

            if (label.equalsIgnoreCase("plastic"))
            {
                LoopMotor(TEP_PIN2, DIR_PIN2, ENA_PIN2, 800, 1, 500);
                LoopMotor(TEP_PIN1, DIR_PIN1, ENA_PIN1, 800, 0, 500);
                delay(2000);
                LoopMotor(TEP_PIN2, DIR_PIN2, ENA_PIN2, 800, 0, 500);
                LoopMotor(TEP_PIN1, DIR_PIN1, ENA_PIN1, 800, 1, 500);
            }
            else if (label.equalsIgnoreCase("metal"))
            {
                LoopMotor(TEP_PIN2, DIR_PIN2, ENA_PIN2, 1600, 1, 500);
                LoopMotor(TEP_PIN1, DIR_PIN1, ENA_PIN1, 800, 0, 500);
                delay(2000);
                LoopMotor(TEP_PIN2, DIR_PIN2, ENA_PIN2, 1600, 0, 500);
                LoopMotor(TEP_PIN1, DIR_PIN1, ENA_PIN1, 800, 1, 500);
            }
            else if (label.equalsIgnoreCase("paper"))
            {
                LoopMotor(TEP_PIN2, DIR_PIN2, ENA_PIN2, 800, 0, 500);
                LoopMotor(TEP_PIN1, DIR_PIN1, ENA_PIN1, 800, 0, 500);
                delay(2000);
                LoopMotor(TEP_PIN2, DIR_PIN2, ENA_PIN2, 800, 1, 500);
                LoopMotor(TEP_PIN1, DIR_PIN1, ENA_PIN1, 800, 1, 500);
            }
            else
            {
                LoopMotor(TEP_PIN1, DIR_PIN1, ENA_PIN1, 800, 0, 500);
                delay(2000);
                LoopMotor(TEP_PIN1, DIR_PIN1, ENA_PIN1, 800, 1, 500);
            }
        }
        delay(500);
    }
}

// Test code
// #include <Arduino.h>
// #include <distance.h>
// #include <dong_co.h>
// // #include <lcd.h>

// // Cấu hình chân động cơ DC2 (quay khay phân loại)
// const int ENA_PIN2 = 44;
// const int DIR_PIN2 = 43;
// const int TEP_PIN2 = 42;

// void setup()
// {
//     Serial.begin(9600);
//     SetupMotor(TEP_PIN2, DIR_PIN2, ENA_PIN2); // chỉ test DC2

//     Serial.println("====== TEST DC2 + SENSOR ======");
//     Serial.println("[p] Quay sang plastic");
//     Serial.println("[m] Quay sang metal");
//     Serial.println("[a] Quay sang paper");
// }

// void loop()
// {
//     // Nhận lệnh từ Serial
//     if (Serial.available())
//     {
//         char cmd = Serial.read();

//         if (cmd == '')
//         {
//             Serial.println("Plastic => quay 90 do CW");
//             LoopMotor(TEP_PIN2, DIR_PIN2, ENA_PIN2, 800, 1, 500); // quay 90 độ CW
//             // delay(10000);
//             // LoopMotor(TEP_PIN2, DIR_PIN2, ENA_PIN2, 50, 0, 300); // quay lại
//         }
//          if (cmd == 'p')
//         {
//             Serial.println("Plastic => quay 90 do CW");
//             LoopMotor(TEP_PIN2, DIR_PIN2, ENA_PIN2, 800, 1, 500); // quay 90 độ CW
//             // delay(10000);
//             // LoopMotor(TEP_PIN2, DIR_PIN2, ENA_PIN2, 50, 0, 300); // quay lại
//         }
//     }

//     delay(500); // giảm nhiễu từ cảm biến
// }
