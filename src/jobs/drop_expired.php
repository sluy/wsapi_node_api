<?php

try {
    $config = json_decode(file_get_contents(dirname(__DIR__) . '/config.json'), true);
    if (!is_array($config)) {
        return;
    }
    $url = $config['url'] . "/?route=instances/all";
    $api_key = $config['key'];
    $headers = [
        'api_key: '.$api_key,
        'client_id: 1',
        'Content-Type: application/json; charset=utf-8',
        '_method: delete'
    ];
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    echo "HERE WE GO ::::::::::" . $url . "\n";
    $server_output = curl_exec ($ch);
    curl_close ($ch);
    print $server_output;
} catch (\Exeption $th) {
    echo $th->getMessage() . "\n";
}



