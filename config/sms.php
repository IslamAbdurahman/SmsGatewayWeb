<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SMS Modem Configuration
    |--------------------------------------------------------------------------
    | Configure the serial port and baud rate for the GSM modem.
    */
    'port'    => env('SMS_MODEM_PORT', 'COM3'),
    'baud'    => (int) env('SMS_MODEM_BAUD', 9600),
    'timeout' => (int) env('SMS_MODEM_TIMEOUT', 3),
];
