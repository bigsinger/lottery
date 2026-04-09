<?php
/**
 * 加载用户配置
 * 接收 GET 请求，从 user/{username}.json 读取配置
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 处理 OPTIONS 预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 只接受 GET 请求
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => '只接受 GET 请求']);
    exit;
}

// 获取用户标识
$user = isset($_GET['user']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['user']) : '';

if (empty($user)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => '缺少用户标识']);
    exit;
}

// 读取配置文件
$configFile = dirname(__DIR__) . '/user/' . $user . '.json';

if (!file_exists($configFile)) {
    echo json_encode([
        'success' => true,
        'exists' => false,
        'message' => '用户配置不存在'
    ]);
    exit;
}

$configContent = file_get_contents($configFile);
if ($configContent === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => '读取配置失败']);
    exit;
}

$config = json_decode($configContent, true);
if ($config === null) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => '配置文件格式错误']);
    exit;
}

echo json_encode([
    'success' => true,
    'exists' => true,
    'config' => $config
]);