<?php
/**
 * 保存用户配置
 * 接收 POST 请求，保存配置到 user/{username}.json
 * 
 * 数据结构：一个 user 的 JSON 文件包含多个 mode 配置
 * {
 *   "user": "张三",
 *   "modes": {
 *     "default": { "title": "...", "prizes": [...], "updatedAt": "..." },
 *     "team1": { "title": "...", "prizes": [...], "updatedAt": "..." }
 *   },
 *   "updatedAt": "..."
 * }
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

$user = preg_replace('/[^a-zA-Z0-9_\-\x{4e00}-\x{9fa5}]/u', '', $data['user']);
if (empty($user)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => '无效的用户标识']);
    exit;
}

// 获取模式名称
$mode = isset($data['mode']) ? preg_replace('/[^a-zA-Z0-9_\-\x{4e00}-\x{9fa5}]/u', '', $data['mode']) : 'default';
if (empty($mode)) {
    $mode = 'default';
}

// 确保用户目录存在
$userDir = dirname(__DIR__) . '/user';
if (!is_dir($userDir)) {
    mkdir($userDir, 0755, true);
}

// 配置文件路径
$configFile = $userDir . '/' . $user . '.json';

// 读取现有配置（如果存在）
$existingConfig = null;
if (file_exists($configFile)) {
    $existingContent = file_get_contents($configFile);
    if ($existingContent !== false) {
        $existingConfig = json_decode($existingContent, true);
    }
}

// 构建新的 mode 配置
$newModeConfig = [
    'title' => $data['title'] ?? '幸运抽奖',
    'prizes' => $data['prizes'] ?? [],
    'updatedAt' => date('c')
];

// 构建/更新完整配置
if ($existingConfig && isset($existingConfig['modes'])) {
    // 更新现有配置中的指定 mode
    $existingConfig['modes'][$mode] = $newModeConfig;
    $existingConfig['updatedAt'] = date('c');
    $fullConfig = $existingConfig;
} else {
    // 创建新配置
    $fullConfig = [
        'user' => $user,
        'modes' => [
            $mode => $newModeConfig
        ],
        'updatedAt' => date('c')
    ];
}

// 保存配置文件
$success = file_put_contents($configFile, json_encode($fullConfig, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

if ($success === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => '保存配置失败']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => '配置保存成功',
    'file' => $user . '.json',
    'mode' => $mode,
    'modesCount' => count($fullConfig['modes'])
]);