<?php
/**
 * 保存用户配置
 * 接收 POST 请求，保存配置到 user/{username}.json
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 处理 OPTIONS 预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 只接受 POST 请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => '只接受 POST 请求']);
    exit;
}

// 获取请求数据
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => '无效的 JSON 数据']);
    exit;
}

// 验证必要字段
if (empty($data['user'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => '缺少用户标识']);
    exit;
}

$user = preg_replace('/[^a-zA-Z0-9_-]/', '', $data['user']);
if (empty($user)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => '无效的用户标识']);
    exit;
}

// 构建配置数据
$config = [
    'user' => $user,
    'mode' => $data['mode'] ?? 'default',
    'title' => $data['title'] ?? '幸运抽奖',
    'prizes' => $data['prizes'] ?? [],
    'updatedAt' => date('c')
];

// 确保用户目录存在
$userDir = dirname(__DIR__) . '/user';
if (!is_dir($userDir)) {
    mkdir($userDir, 0755, true);
}

// 保存配置文件
$configFile = $userDir . '/' . $user . '.json';
$success = file_put_contents($configFile, json_encode($config, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

if ($success === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => '保存配置失败']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => '配置保存成功',
    'file' => $user . '.json'
]);