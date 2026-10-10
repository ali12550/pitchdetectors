<?php
header("Content-Type: application/xml; charset=UTF-8");

$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https" : "https";
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'pitchdetectors.com';
$baseUrl = $protocol . "://" . $host;
$rootDir = __DIR__;

// Excluded directories
$excludeDirs = [
    '.git',
    '.idea',
    'node_modules',
    'vendor',
    'assets',
    'css',
    'js',
    'images'
];

// Excluded files
$excludeFiles = [
    'index.php',
    'site_map.php',
    'site_map.xml',
    'sitemap.php',
    'header.html',
    'footer.html',
    '404.html'
];

function scanSite($dir, $baseUrl, $excludeDirs, $excludeFiles) {
    $urls = [];

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS)
    );

    foreach ($iterator as $file) {

        $path = $file->getPathname();

        foreach ($excludeDirs as $exclude) {
            if (strpos($path, DIRECTORY_SEPARATOR . $exclude . DIRECTORY_SEPARATOR) !== false) {
                continue 2;
            }
        }

        if ($file->isFile() && strtolower($file->getExtension()) === 'html') {

            if (in_array($file->getFilename(), $excludeFiles, true)) {
                continue;
            }

            $relativePath = str_replace($dir, '', $path);
$relativePath = str_replace(DIRECTORY_SEPARATOR, '/', $relativePath);

// Normalize index.html to directory URL
if (basename($relativePath) === 'index.html') {
    $relativePath = rtrim(dirname($relativePath), '/') . '/';
}

$urls[] = [
    'loc'      => $baseUrl . $relativePath,
    'lastmod'  => gmdate('c', $file->getMTime()),
    'priority' => calculatePriority($relativePath)
];

        }
    }

    return $urls;
}

function calculatePriority($path) {
    $cleanPath = trim($path, '/');
    if ($cleanPath === '') return '1.00';
    if (strpos($cleanPath, 'audiobook-') === 0 || $cleanPath === 'articles') return '0.80';
    if (strpos($cleanPath, 'articles/') === 0) return '0.70';
    if (in_array($cleanPath, ['about', 'contact'])) return '0.60';
    return '0.40';
}

$urls = scanSite($rootDir, $baseUrl, $excludeDirs, $excludeFiles);

echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

foreach ($urls as $url) {
    echo '<url>';
    echo '<loc>' . htmlspecialchars($url['loc'], ENT_XML1, 'UTF-8') . '</loc>';
    echo '<lastmod>' . $url['lastmod'] . '</lastmod>';
    echo '<priority>' . $url['priority'] . '</priority>';
    echo '</url>';
}

echo '</urlset>';
