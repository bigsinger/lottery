<?php
/**
 * 加载用户配置
 * 接收 GET 请求，从 user/{username}.json 读取配置
 * 
 * 数据结构：一个 user 的 JSON 文件包含多个 mode 配置
 * - user 参数：指定 JSON 文件名
 * - mode 参数：指定在该 JSON 中使用哪个 mode 配置
 * - 如果 mode 不存在，返回 modeExists=false，保存时会自动创建
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
$user = isset($_GET['user']) ? preg_replace('/[^a-zA-Z0-9_\-\x{4e00}-\x{9fa5}]/u', '', $_GET['user']) : '';

if (empty($user)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => '缺少用户标识']);
    exit;
}

// 获取模式名称
$mode = isset($_GET['mode']) ? preg_replace('/[^a-zA-Z0-9_\-\x{4e00}-\x{9fa5}]/u', '', $_GET['mode']) : 'default';
if (empty($mode)) {
    $mode = 'default';
}

// 读取配置文件
$configFile = dirname(__DIR__) . '/user/' . $user . '.json';

if (!file_exists($configFile)) {
    echo json_encode([
        'success' => true,
        'exists' => false,
        'modeExists' => false,
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

$fullConfig = json_decode($configContent, true);
if ($fullConfig === null) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => '配置文件格式错误']);
    exit;
}

// 检查是否存在 modes 结构
if (!isset($fullConfig['modes']) || !is_array($fullConfig['modes'])) {
    // 旧格式配置（单个 mode），迁移到新格式
    $modeConfig = [
        'title' => $fullConfig['title'] ?? '幸运抽奖',
        'prizes' => $fullConfig['prizes'] ?? [],
        'updatedAt' => $fullConfig['updatedAt'] ?? date('c')
    ];
    
    // 返回配置，同时提示需要迁移
    echo json_encode([
        'success' => true,
        'exists' => true,
        'modeExists' => true,
        'config' => $modeConfig,
        'mode' => $mode,
        'availableModes' => [$mode],
        'message' => '配置加载成功'
    ]);
    exit;
}

// 检查指定的 mode 是否存在
if (!isset($fullConfig['modes'][$mode])) {
    // mode 不存在，返回所有可用的 mode
    $availableModes = array_keys($fullConfig['modes']);
    echo json_encode([
        'success' => true,
        'exists' => true,
        'modeExists' => false,
        'mode' => $mode,
        'availableModes' => $availableModes,
        'message' => '模式不存在，保存时将自动创建'
    ]);
    exit;
}

// 返回指定 mode 的配置
$modeConfig = $fullConfig['modes'][$mode];
$availableModes = array_keys($fullConfig['modes']);

echo json_encode([
    'success' => true,
    'exists' => true,
    'modeExists' => true,
    'config' => $modeConfig,
    'mode' => $mode,
    'availableModes' => $availableModes,
    'message' => '配置加载成功'
]);