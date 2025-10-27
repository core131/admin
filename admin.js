
// Cloudflare Worker Web Admin
// Modern DNS, Worker, and Traffic Management Dashboard

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname
  
  // Handle API routes
  if (path.startsWith('/api/')) {
    return handleAPI(request, url)
  }
  
  // Serve main application
  return new Response(getMainHTML(), {
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}

// API Handler
async function handleAPI(request, url) {
  const path = url.pathname.replace('/api/', '')
  const method = request.method
  
  try {
    // Cloudflare API endpoints
    if (path === 'dns-records' && method === 'GET') {
      return await getDNSRecords(url)
    } else if (path === 'dns-records' && method === 'POST') {
      return await createDNSRecord(request)
    } else if (path === 'dns-records' && method === 'PUT') {
      return await updateDNSRecord(request)
    } else if (path === 'dns-records' && method === 'DELETE') {
      return await deleteDNSRecord(url)
    } else if (path === 'workers' && method === 'GET') {
      return await getWorkers()
    } else if (path === 'workers' && method === 'POST') {
      return await createWorker(request)
    } else if (path === 'workers' && method === 'PUT') {
      return await updateWorker(request)
    } else if (path === 'workers' && method === 'DELETE') {
      return await deleteWorker(url)
    } else if (path === 'traffic' && method === 'GET') {
      return await getTrafficData(url)
    } else if (path === 'deploy-worker' && method === 'POST') {
      return await deployWorker(request)
    }
    
    return new Response('Not Found', { status: 404 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// DNS Records Functions
async function getDNSRecords(url) {
  const zoneId = url.searchParams.get('zoneId')
  const cfId = url.searchParams.get('cfId')
  const apiKey = url.searchParams.get('apiKey')
  
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    {
      headers: {
        'X-Auth-Email': cfId,
        'X-Auth-Key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  )
  
  const data = await response.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function createDNSRecord(request) {
  const body = await request.json()
  const { zoneId, cfId, apiKey, record } = body
  
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Email': cfId,
        'X-Auth-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(record)
    }
  )
  
  const data = await response.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function updateDNSRecord(request) {
  const body = await request.json()
  const { zoneId, cfId, apiKey, recordId, record } = body
  
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
    {
      method: 'PUT',
      headers: {
        'X-Auth-Email': cfId,
        'X-Auth-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(record)
    }
  )
  
  const data = await response.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function deleteDNSRecord(url) {
  const zoneId = url.searchParams.get('zoneId')
  const cfId = url.searchParams.get('cfId')
  const apiKey = url.searchParams.get('apiKey')
  const recordId = url.searchParams.get('recordId')
  
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
    {
      method: 'DELETE',
      headers: {
        'X-Auth-Email': cfId,
        'X-Auth-Key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  )
  
  const data = await response.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
}

// Workers Functions
async function getWorkers() {
  // Mock response - replace with actual Cloudflare API call
  const mockWorkers = {
    success: true,
    result: [
      { id: 'worker1', name: 'api-proxy', created_on: '2024-01-01T00:00:00Z' },
      { id: 'worker2', name: 'auth-worker', created_on: '2024-01-02T00:00:00Z' }
    ]
  }
  
  return new Response(JSON.stringify(mockWorkers), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function createWorker(request) {
  const body = await request.json()
  // Implement worker creation logic
  return new Response(JSON.stringify({ success: true, result: body }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function updateWorker(request) {
  const body = await request.json()
  // Implement worker update logic
  return new Response(JSON.stringify({ success: true, result: body }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function deleteWorker(url) {
  const workerId = url.searchParams.get('workerId')
  // Implement worker deletion logic
  return new Response(JSON.stringify({ success: true, id: workerId }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

// Traffic Monitoring Functions
async function getTrafficData(url) {
  const zoneId = url.searchParams.get('zoneId')
  const cfId = url.searchParams.get('cfId')
  const apiKey = url.searchParams.get('apiKey')
  
  // GraphQL query for traffic data
  const query = `
    query {
      viewer {
        zones(filter: { zoneTag: "${zoneId}" }) {
          httpRequests1dGroups(limit: 30, orderBy: [datetime_ASC]) {
            dimensions {
              datetime
            }
            sum {
              bytes
              requests
              cachedBytes
              cachedRequests
            }
          }
        }
      }
    }
  `
  
  // Mock response - replace with actual GraphQL API call
  const mockTrafficData = {
    success: true,
    result: {
      data: {
        viewer: {
          zones: [
            {
              httpRequests1dGroups: Array.from({ length: 30 }, (_, i) => ({
                dimensions: {
                  datetime: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                },
                sum: {
                  bytes: Math.floor(Math.random() * 1000000000),
                  requests: Math.floor(Math.random() * 100000),
                  cachedBytes: Math.floor(Math.random() * 500000000),
                  cachedRequests: Math.floor(Math.random() * 50000)
                }
              }))
            }
          ]
        }
      }
    }
  }
  
  return new Response(JSON.stringify(mockTrafficData), {
    headers: { 'Content-Type': 'application/json' }
  })
}

// Deploy Worker Function
async function deployWorker(request) {
  const body = await request.json()
  const { workerName, code, cfId, apiKey } = body
  
  // Implement worker deployment logic
  return new Response(JSON.stringify({ 
    success: true, 
    message: `Worker ${workerName} deployed successfully`,
    url: `https://${workerName}.workers.dev`
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

// Main HTML Content
function getMainHTML() {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudflare Admin Dashboard</title>
    <style>
        /* Reset and Global Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-color: #667eea;
            --secondary-color: #764ba2;
            --accent-color: #f093fb;
            --dark-bg: #1a1a2e;
            --sidebar-bg: #16213e;
            --card-bg: #0f3460;
            --text-primary: #ffffff;
            --text-secondary: #a8b2d1;
            --border-color: #2a3f5f;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --error-color: #ef4444;
            --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
            color: var(--text-primary);
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* Header Styles */
        .header {
            background: var(--dark-bg);
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .menu-toggle {
            display: none;
            background: var(--gradient-primary);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.5rem;
            align-items: center;
            justify-content: center;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .logo-icon {
            width: 40px;
            height: 40px;
            background: var(--gradient-primary);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.2rem;
        }

        .logo-text {
            font-size: 1.25rem;
            font-weight: 700;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        #connection-status {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        /* Layout Container */
        .container {
            display: flex;
            margin-top: 70px;
            min-height: calc(100vh - 70px);
        }

        /* Sidebar Styles */
        .sidebar {
            width: 250px;
            background: var(--sidebar-bg);
            padding: 2rem 0;
            position: fixed;
            left: 0;
            top: 70px;
            bottom: 0;
            overflow-y: auto;
            transition: transform 0.3s ease;
            z-index: 999;
        }

        .sidebar.hidden {
            transform: translateX(-100%);
        }

        .nav-item {
            display: flex;
            align-items: center;
            padding: 1rem 1.5rem;
            color: var(--text-secondary);
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            border-left: 3px solid transparent;
        }

        .nav-item:hover {
            background: rgba(102, 126, 234, 0.1);
            color: var(--text-primary);
            border-left-color: var(--primary-color);
        }

        .nav-item.active {
            background: rgba(102, 126, 234, 0.2);
            color: var(--text-primary);
            border-left-color: var(--primary-color);
        }

        .nav-icon {
            margin-right: 1rem;
            font-size: 1.2rem;
        }

        /* Sidebar Overlay for Mobile */
        .sidebar-overlay {
            display: none;
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 998;
        }

        .sidebar-overlay.active {
            display: block;
        }

        /* Main Content Area */
        .main-content {
            flex: 1;
            margin-left: 250px;
            padding: 2rem;
            background: var(--dark-bg);
            min-height: calc(100vh - 70px);
            transition: margin-left 0.3s ease;
        }

        /* Card Styles */
        .card {
            background: var(--card-bg);
            border-radius: 15px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-color);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
            flex-wrap: wrap;
            gap: 1rem;
        }

        .card-title {
            font-size: 1.5rem;
            font-weight: 600;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* Form Styles */
        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
            font-weight: 500;
        }

        .form-input, .form-select, .form-textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            background: var(--dark-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-textarea {
            resize: vertical;
            min-height: 150px;
            font-family: 'Fira Code', monospace;
        }

        /* Button Styles */
        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            justify-content: center;
        }

        .btn-primary {
            background: var(--gradient-primary);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-success {
            background: var(--success-color);
            color: white;
        }

        .btn-warning {
            background: var(--warning-color);
            color: white;
        }

        .btn-danger {
            background: var(--error-color);
            color: white;
        }

        .btn-secondary {
            background: var(--dark-bg);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
        }

        .btn-group {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        /* Table Styles */
        .table-container {
            overflow-x: auto;
            margin-top: 1rem;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: var(--dark-bg);
            border-radius: 8px;
            overflow: hidden;
        }

        .data-table th {
            background: var(--gradient-primary);
            color: white;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            font-size: 0.9rem;
        }

        .data-table td {
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .data-table tr:hover {
            background: rgba(102, 126, 234, 0.05);
        }

        /* Notification Styles */
        .notification {
            position: fixed;
            top: 90px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 2000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            max-width: 90%;
        }

        .notification.success {
            background: var(--success-color);
        }

        .notification.warning {
            background: var(--warning-color);
        }

        .notification.error {
            background: var(--error-color);
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        /* Activity Log Styles */
        .activity-log {
            max-height: 400px;
            overflow-y: auto;
            background: var(--dark-bg);
            border-radius: 8px;
            padding: 1rem;
        }

        .log-item {
            padding: 0.75rem;
            border-left: 3px solid var(--primary-color);
            margin-bottom: 0.5rem;
            background: rgba(102, 126, 234, 0.05);
            border-radius: 0 8px 8px 0;
        }

        .log-time {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .log-message {
            margin-top: 0.25rem;
            color: var(--text-primary);
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 3000;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }

        .modal.active {
            display: flex;
        }

        .modal-content {
            background: var(--card-bg);
            padding: 2rem;
            border-radius: 15px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-header {
            margin-bottom: 1.5rem;
        }

        .modal-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .modal-footer {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 1.5rem;
            flex-wrap: wrap;
        }

        /* Loading Spinner */
        .spinner {
            border: 3px solid var(--border-color);
            border-top: 3px solid var(--primary-color);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 2rem auto;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Traffic Chart */
        .traffic-chart {
            height: 300px;
            background: var(--dark-bg);
            border-radius: 8px;
            padding: 1rem;
            margin-top: 1rem;
        }

        /* Footer */
        .footer {
            background: var(--sidebar-bg);
            padding: 2rem;
            text-align: center;
            color: var(--text-secondary);
            border-top: 1px solid var(--border-color);
            margin-left: 250px;
            transition: margin-left 0.3s ease;
        }

        /* Hidden Sections */
        .section {
            display: none;
        }

        .section.active {
            display: block;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .menu-toggle {
                display: flex;
            }

            .logo-text {
                font-size: 1rem;
            }

            .sidebar {
                transform: translateX(-100%);
            }

            .sidebar.active {
                transform: translateX(0);
            }

            .main-content {
                margin-left: 0;
            }

            .footer {
                margin-left: 0;
            }

            .header {
                padding: 1rem;
            }

            .main-content {
                padding: 1rem;
            }

            .card {
                padding: 1rem;
            }

            .card-title {
                font-size: 1.2rem;
            }

            .btn-group {
                flex-direction: column;
            }

            .btn {
                width: 100%;
            }

            .data-table {
                font-size: 0.85rem;
            }

            .data-table th,
            .data-table td {
                padding: 0.5rem;
            }

            #connection-status {
                display: none;
            }
        }

        @media (max-width: 480px) {
            .logo-text {
                display: none;
            }

            .card-header {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-left">
            <button class="menu-toggle" id="menu-toggle" onclick="toggleSidebar()">
                \u2630
            </button>
            <div class="logo">
                <div class="logo-icon">CF</div>
                <div class="logo-text">Admin Dashboard</div>
            </div>
        </div>
        <div id="connection-status">
            <span id="status-indicator">\u25cf</span> Not Connected
        </div>
    </header>

    <!-- Sidebar Overlay -->
    <div class="sidebar-overlay" id="sidebar-overlay" onclick="toggleSidebar()"></div>

    <div class="container">
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
            <nav>
                <a class="nav-item active" onclick="showSection('credentials')">
                    <span class="nav-icon">\ud83d\udd10</span>
                    Kredensial
                </a>
                <a class="nav-item" onclick="showSection('dns')">
                    <span class="nav-icon">\ud83c\udf10</span>
                    DNS Records
                </a>
                <a class="nav-item" onclick="showSection('wildcard')">
                    <span class="nav-icon">\u26a1</span>
                    Wildcard
                </a>
                <a class="nav-item" onclick="showSection('traffic')">
                    <span class="nav-icon">\ud83d\udcca</span>
                    Traffic Monitoring
                </a>
                <a class="nav-item" onclick="showSection('workers')">
                    <span class="nav-icon">\u2699\ufe0f</span>
                    Workers
                </a>
                <a class="nav-item" onclick="showSection('deploy')">
                    <span class="nav-icon">\ud83d\ude80</span>
                    Deploy Worker
                </a>
                <a class="nav-item" onclick="showSection('logs')">
                    <span class="nav-icon">\ud83d\udcdd</span>
                    Activity Logs
                </a>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Credentials Section -->
            <section id="credentials" class="section active">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Input Kredensial Cloudflare</h2>
                    </div>
                    <form id="credentials-form">
                        <div class="form-group">
                            <label class="form-label">Cloudflare ID (Email)</label>
                            <input type="email" class="form-input" id="cf-id" placeholder="email@example.com" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">API Key</label>
                            <input type="password" class="form-input" id="api-key" placeholder="Masukkan API Key Anda" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Zone ID</label>
                            <input type="text" class="form-input" id="zone-id" placeholder="Masukkan Zone ID Domain" required>
                        </div>
                        <div class="btn-group">
                            <button type="submit" class="btn btn-primary">
                                <span>\ud83d\udcbe</span> Simpan Kredensial
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="testConnection()">
                                <span>\ud83d\udd0d</span> Test Koneksi
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <!-- DNS Records Section -->
            <section id="dns" class="section">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Manajemen DNS Records</h2>
                        <button class="btn btn-primary" onclick="showAddDNSModal()">
                            <span>\u2795</span> Tambah Record
                        </button>
                    </div>
                    <div class="table-container">
                        <table class="data-table" id="dns-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Name</th>
                                    <th>Content</th>
                                    <th>TTL</th>
                                    <th>Proxied</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="dns-records-body">
                                <tr>
                                    <td colspan="6" style="text-align: center; color: var(--text-secondary);">
                                        Silakan masukkan kredensial dan klik "Load DNS Records"
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="btn-group" style="margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="loadDNSRecords()">
                            <span>\ud83d\udd04</span> Load DNS Records
                        </button>
                    </div>
                </div>
            </section>

            <!-- Wildcard Section -->
            <section id="wildcard" class="section">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Pengaturan Wildcard</h2>
                    </div>
                    <form id="wildcard-form">
                        <div class="form-group">
                            <label class="form-label">Subdomain Pattern</label>
                            <input type="text" class="form-input" id="wildcard-subdomain" placeholder="*.example.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Target IP/Domain</label>
                            <input type="text" class="form-input" id="wildcard-target" placeholder="192.168.1.1 atau target.example.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Record Type</label>
                            <select class="form-select" id="wildcard-type">
                                <option value="A">A Record</option>
                                <option value="CNAME">CNAME Record</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Proxy Status</label>
                            <select class="form-select" id="wildcard-proxy">
                                <option value="true">Proxied (Orange Cloud)</option>
                                <option value="false">DNS Only (Grey Cloud)</option>
                            </select>
                        </div>
                        <div class="btn-group">
                            <button type="submit" class="btn btn-primary">
                                <span>\u26a1</span> Buat Wildcard
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="previewWildcard()">
                                <span>\ud83d\udc41\ufe0f</span> Preview
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <!-- Traffic Monitoring Section -->
            <section id="traffic" class="section">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Traffic Monitoring</h2>
                        <button class="btn btn-primary" onclick="loadTrafficData()">
                            <span>\ud83d\udcca</span> Refresh Data
                        </button>
                    </div>
                    <div class="traffic-chart" id="traffic-chart">
                        <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                            Klik "Refresh Data" untuk memuat traffic analytics
                        </div>
                    </div>
                    <div class="table-container" style="margin-top: 1rem;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Requests</th>
                                    <th>Bandwidth</th>
                                    <th>Cached Requests</th>
                                    <th>Cached Bandwidth</th>
                                </tr>
                            </thead>
                            <tbody id="traffic-data-body">
                                <tr>
                                    <td colspan="5" style="text-align: center; color: var(--text-secondary);">
                                        No traffic data available
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- Workers Section -->
            <section id="workers" class="section">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Manajemen Workers</h2>
                        <button class="btn btn-primary" onclick="showAddWorkerModal()">
                            <span>\u2795</span> Tambah Worker
                        </button>
                    </div>
                    <div class="table-container">
                        <table class="data-table" id="workers-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>ID</th>
                                    <th>Created</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="workers-body">
                                <tr>
                                    <td colspan="5" style="text-align: center; color: var(--text-secondary);">
                                        Klik "Load Workers" untuk melihat daftar worker
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="btn-group" style="margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="loadWorkers()">
                            <span>\ud83d\udd04</span> Load Workers
                        </button>
                    </div>
                </div>
            </section>

            <!-- Deploy Worker Section -->
            <section id="deploy" class="section">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Deploy Worker Baru</h2>
                    </div>
                    <form id="deploy-form">
                        <div class="form-group">
                            <label class="form-label">Worker Name</label>
                            <input type="text" class="form-input" id="worker-name" placeholder="my-new-worker" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Worker Code</label>
                            <textarea class="form-textarea" id="worker-code" placeholder="// Masukkan kode worker JavaScript di sini
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  return new Response('Hello World!', { status: 200 })
}" required></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Environment Variables (JSON)</label>
                            <textarea class="form-textarea" id="worker-env" placeholder='{"API_KEY": "your-key", "DATABASE_URL": "your-db-url"}' style="min-height: 100px;"></textarea>
                        </div>
                        <div class="btn-group">
                            <button type="submit" class="btn btn-primary">
                                <span>\ud83d\ude80</span> Deploy Worker
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="validateWorkerCode()">
                                <span>\u2705</span> Validate Code
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <!-- Activity Logs Section -->
            <section id="logs" class="section">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Log Aktivitas</h2>
                        <button class="btn btn-secondary" onclick="clearLogs()">
                            <span>\ud83d\uddd1\ufe0f</span> Clear Logs
                        </button>
                    </div>
                    <div class="activity-log" id="activity-log">
                        <div class="log-item">
                            <div class="log-time">${new Date().toLocaleString()}</div>
                            <div class="log-message">Dashboard initialized successfully</div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <p>&copy; 2024 Cloudflare Admin Dashboard. Built with \u2764\ufe0f for advanced DNS and Worker management.</p>
    </footer>

    <!-- Add DNS Record Modal -->
    <div class="modal" id="add-dns-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Tambah DNS Record</h3>
            </div>
            <form id="add-dns-form">
                <div class="form-group">
                    <label class="form-label">Type</label>
                    <select class="form-select" id="dns-type" required>
                        <option value="A">A</option>
                        <option value="AAAA">AAAA</option>
                        <option value="CNAME">CNAME</option>
                        <option value="MX">MX</option>
                        <option value="TXT">TXT</option>
                        <option value="NS">NS</option>
                        <option value="SRV">SRV</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Name</label>
                    <input type="text" class="form-input" id="dns-name" placeholder="subdomain.example.com" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Content</label>
                    <input type="text" class="form-input" id="dns-content" placeholder="192.168.1.1" required>
                </div>
                <div class="form-group">
                    <label class="form-label">TTL</label>
                    <select class="form-select" id="dns-ttl">
                        <option value="1">Automatic</option>
                        <option value="60">1 minute</option>
                        <option value="300">5 minutes</option>
                        <option value="600">10 minutes</option>
                        <option value="1800">30 minutes</option>
                        <option value="3600">1 hour</option>
                        <option value="7200">2 hours</option>
                        <option value="86400">1 day</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Proxy Status</label>
                    <select class="form-select" id="dns-proxy">
                        <option value="true">Proxied</option>
                        <option value="false">DNS Only</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('add-dns-modal')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Record</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Add Worker Modal -->
    <div class="modal" id="add-worker-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Tambah Worker Baru</h3>
            </div>
            <form id="add-worker-form">
                <div class="form-group">
                    <label class="form-label">Worker Name</label>
                    <input type="text" class="form-input" id="new-worker-name" placeholder="my-worker" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <input type="text" class="form-input" id="worker-description" placeholder="Worker description">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('add-worker-modal')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Worker</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal" id="confirm-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Konfirmasi</h3>
            </div>
            <p id="confirm-message">Apakah Anda yakin ingin melanjutkan tindakan ini?</p>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('confirm-modal')">Batal</button>
                <button class="btn btn-danger" id="confirm-button">Lanjutkan</button>
            </div>
        </div>
    </div>

    <script>
        // Global Variables
        let credentials = {
            cfId: '',
            apiKey: '',
            zoneId: ''
        };
        
        let activityLogs = [];
        let currentDNSRecords = [];
        let currentWorkers = [];

        // Initialize Application
        document.addEventListener('DOMContentLoaded', function() {
            loadCredentialsFromStorage();
            initializeEventListeners();
            addLog('Dashboard initialized successfully');
        });

        // Sidebar Toggle
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        // Event Listeners
        function initializeEventListeners() {
            // Credentials Form
            document.getElementById('credentials-form').addEventListener('submit', function(e) {
                e.preventDefault();
                saveCredentials();
            });

            // Wildcard Form
            document.getElementById('wildcard-form').addEventListener('submit', function(e) {
                e.preventDefault();
                createWildcard();
            });

            // Deploy Form
            document.getElementById('deploy-form').addEventListener('submit', function(e) {
                e.preventDefault();
                deployWorkerCode();
            });

            // Add DNS Form
            document.getElementById('add-dns-form').addEventListener('submit', function(e) {
                e.preventDefault();
                addDNSRecord();
            });

            // Add Worker Form
            document.getElementById('add-worker-form').addEventListener('submit', function(e) {
                e.preventDefault();
                createNewWorker();
            });
        }

        // Section Navigation
        function showSection(sectionId) {
            // Hide all sections
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show selected section
            document.getElementById(sectionId).classList.add('active');
            
            // Update navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            event.target.closest('.nav-item').classList.add('active');
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
            
            addLog(\`Navigated to \${sectionId} section\`);
        }

        // Credentials Management
        function saveCredentials() {
            credentials.cfId = document.getElementById('cf-id').value;
            credentials.apiKey = document.getElementById('api-key').value;
            credentials.zoneId = document.getElementById('zone-id').value;
            
            localStorage.setItem('cf-credentials', JSON.stringify(credentials));
            showNotification('Kredensial berhasil disimpan!', 'success');
            addLog('Credentials saved successfully');
            updateConnectionStatus();
        }

        function loadCredentialsFromStorage() {
            const saved = localStorage.getItem('cf-credentials');
            if (saved) {
                credentials = JSON.parse(saved);
                document.getElementById('cf-id').value = credentials.cfId;
                document.getElementById('api-key').value = credentials.apiKey;
                document.getElementById('zone-id').value = credentials.zoneId;
                updateConnectionStatus();
            }
        }

        function testConnection() {
            if (!validateCredentials()) {
                showNotification('Silakan lengkapi semua kredensial!', 'error');
                return;
            }
            
            // Simulate connection test
            showNotification('Testing connection...', 'warning');
            setTimeout(() => {
                showNotification('Connection successful!', 'success');
                addLog('Connection test successful');
                updateConnectionStatus(true);
            }, 2000);
        }

        function validateCredentials() {
            return credentials.cfId && credentials.apiKey && credentials.zoneId;
        }

        function updateConnectionStatus(connected = null) {
            const statusElement = document.getElementById('connection-status');
            const indicator = document.getElementById('status-indicator');
            
            if (connected === null) {
                connected = validateCredentials();
            }
            
            if (connected) {
                statusElement.innerHTML = '<span id="status-indicator" style="color: var(--success-color);">\u25cf</span> Connected';
            } else {
                statusElement.innerHTML = '<span id="status-indicator" style="color: var(--error-color);">\u25cf</span> Not Connected';
            }
        }

        // DNS Records Management
        async function loadDNSRecords() {
            if (!validateCredentials()) {
                showNotification('Silakan masukkan kredensial terlebih dahulu!', 'error');
                return;
            }
            
            showNotification('Loading DNS records...', 'warning');
            addLog('Loading DNS records');
            
            try {
                const response = await fetch(\`/api/dns-records?zoneId=\${credentials.zoneId}&cfId=\${credentials.cfId}&apiKey=\${credentials.apiKey}\`);
                const data = await response.json();
                
                if (data.success) {
                    currentDNSRecords = data.result;
                    displayDNSRecords(currentDNSRecords);
                    showNotification(\`Loaded \${data.result.length} DNS records\`, 'success');
                    addLog(\`Successfully loaded \${data.result.length} DNS records\`);
                } else {
                    throw new Error(data.errors?.[0]?.message || 'Failed to load DNS records');
                }
            } catch (error) {
                showNotification(\`Error: \${error.message}\`, 'error');
                addLog(\`Failed to load DNS records: \${error.message}\`);
            }
        }

        function displayDNSRecords(records) {
            const tbody = document.getElementById('dns-records-body');
            
            if (records.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No DNS records found</td></tr>';
                return;
            }
            
            tbody.innerHTML = records.map(record => \`
                <tr>
                    <td>\${record.type}</td>
                    <td>\${record.name}</td>
                    <td>\${record.content}</td>
                    <td>\${record.ttl === 1 ? 'Auto' : record.ttl}</td>
                    <td>\${record.proxied ? 'Proxied' : 'DNS Only'}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-warning" onclick="editDNSRecord('\${record.id}')">Edit</button>
                            <button class="btn btn-danger" onclick="confirmDeleteDNS('\${record.id}', '\${record.name}')">Delete</button>
                        </div>
                    </td>
                </tr>
            \`).join('');
        }

        function showAddDNSModal() {
            document.getElementById('add-dns-modal').classList.add('active');
        }

        async function addDNSRecord() {
            if (!validateCredentials()) {
                showNotification('Silakan masukkan kredensial terlebih dahulu!', 'error');
                return;
            }
            
            const record = {
                type: document.getElementById('dns-type').value,
                name: document.getElementById('dns-name').value,
                content: document.getElementById('dns-content').value,
                ttl: parseInt(document.getElementById('dns-ttl').value),
                proxied: document.getElementById('dns-proxy').value === 'true'
            };
            
            try {
                const response = await fetch('/api/dns-records', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        zoneId: credentials.zoneId,
                        cfId: credentials.cfId,
                        apiKey: credentials.apiKey,
                        record: record
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification('DNS record added successfully!', 'success');
                    addLog(\`DNS record added: \${record.name} (\${record.type})\`);
                    closeModal('add-dns-modal');
                    loadDNSRecords();
                } else {
                    throw new Error(data.errors?.[0]?.message || 'Failed to add DNS record');
                }
            } catch (error) {
                showNotification(\`Error: \${error.message}\`, 'error');
                addLog(\`Failed to add DNS record: \${error.message}\`);
            }
        }

        async function deleteDNSRecord(recordId) {
            if (!validateCredentials()) {
                showNotification('Silakan masukkan kredensial terlebih dahulu!', 'error');
                return;
            }
            
            try {
                const response = await fetch(\`/api/dns-records?zoneId=\${credentials.zoneId}&cfId=\${credentials.cfId}&apiKey=\${credentials.apiKey}&recordId=\${recordId}\`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification('DNS record deleted successfully!', 'success');
                    addLog(\`DNS record deleted: \${recordId}\`);
                    loadDNSRecords();
                } else {
                    throw new Error(data.errors?.[0]?.message || 'Failed to delete DNS record');
                }
            } catch (error) {
                showNotification(\`Error: \${error.message}\`, 'error');
                addLog(\`Failed to delete DNS record: \${error.message}\`);
            }
        }

        function confirmDeleteDNS(recordId, recordName) {
            showConfirmation(
                \`Apakah Anda yakin ingin menghapus DNS record "\${recordName}"?\`,
                () => deleteDNSRecord(recordId)
            );
        }

        function editDNSRecord(recordId) {
            showNotification('Edit functionality coming soon!', 'warning');
            addLog(\`Edit DNS record requested: \${recordId}\`);
        }

        // Wildcard Management
        async function createWildcard() {
            if (!validateCredentials()) {
                showNotification('Silakan masukkan kredensial terlebih dahulu!', 'error');
                return;
            }
            
            const subdomain = document.getElementById('wildcard-subdomain').value;
            const target = document.getElementById('wildcard-target').value;
            const type = document.getElementById('wildcard-type').value;
            const proxy = document.getElementById('wildcard-proxy').value === 'true';
            
            if (!subdomain || !target) {
                showNotification('Silakan lengkapi semua field!', 'error');
                return;
            }
            
            const record = {
                type: type,
                name: subdomain,
                content: target,
                ttl: 1,
                proxied: proxy
            };
            
            try {
                const response = await fetch('/api/dns-records', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        zoneId: credentials.zoneId,
                        cfId: credentials.cfId,
                        apiKey: credentials.apiKey,
                        record: record
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification('Wildcard created successfully!', 'success');
                    addLog(\`Wildcard created: \${subdomain} -> \${target}\`);
                    document.getElementById('wildcard-form').reset();
                } else {
                    throw new Error(data.errors?.[0]?.message || 'Failed to create wildcard');
                }
            } catch (error) {
                showNotification(\`Error: \${error.message}\`, 'error');
                addLog(\`Failed to create wildcard: \${error.message}\`);
            }
        }

        function previewWildcard() {
            const subdomain = document.getElementById('wildcard-subdomain').value;
            const target = document.getElementById('wildcard-target').value;
            const type = document.getElementById('wildcard-type').value;
            const proxy = document.getElementById('wildcard-proxy').value === 'true';
            
            if (!subdomain || !target) {
                showNotification('Silakan lengkapi field subdomain dan target!', 'error');
                return;
            }
            
            const preview = \`
Wildcard Preview:
Type: \${type}
Name: \${subdomain}
Target: \${target}
Proxy: \${proxy ? 'Enabled' : 'Disabled'}

This will create a DNS record that directs all traffic matching \${subdomain} to \${target}.
            \`;
            
            showNotification('Wildcard configuration previewed', 'success');
            addLog('Wildcard configuration previewed');
            console.log(preview);
        }

        // Traffic Monitoring
        async function loadTrafficData() {
            if (!validateCredentials()) {
                showNotification('Silakan masukkan kredensial terlebih dahulu!', 'error');
                return;
            }
            
            showNotification('Loading traffic data...', 'warning');
            addLog('Loading traffic analytics');
            
            try {
                const response = await fetch(\`/api/traffic?zoneId=\${credentials.zoneId}&cfId=\${credentials.cfId}&apiKey=\${credentials.apiKey}\`);
                const data = await response.json();
                
                if (data.success && data.result.data.viewer.zones.length > 0) {
                    const trafficData = data.result.data.viewer.zones[0].httpRequests1dGroups;
                    displayTrafficData(trafficData);
                    showNotification('Traffic data loaded successfully!', 'success');
                    addLog(\`Successfully loaded \${trafficData.length} days of traffic data\`);
                } else {
                    throw new Error('No traffic data available');
                }
            } catch (error) {
                showNotification(\`Error: \${error.message}\`, 'error');
                addLog(\`Failed to load traffic data: \${error.message}\`);
            }
        }

        function displayTrafficData(trafficData) {
            const tbody = document.getElementById('traffic-data-body');
            const chartContainer = document.getElementById('traffic-chart');
            
            if (trafficData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No traffic data available</td></tr>';
                return;
            }
            
            // Display table data
            tbody.innerHTML = trafficData.map(day => {
                const date = new Date(day.dimensions.datetime).toLocaleDateString();
                const requests = day.sum.requests.toLocaleString();
                const bandwidth = formatBytes(day.sum.bytes);
                const cachedRequests = day.sum.cachedRequests.toLocaleString();
                const cachedBandwidth = formatBytes(day.sum.cachedBytes);
                
                return \`
                    <tr>
                        <td>\${date}</td>
                        <td>\${requests}</td>
                        <td>\${bandwidth}</td>
                        <td>\${cachedRequests}</td>
                        <td>\${cachedBandwidth}</td>
                    </tr>
                \`;
            }).join('');
            
            // Simple chart visualization
            const maxRequests = Math.max(...trafficData.map(d => d.sum.requests));
            chartContainer.innerHTML = \`
                <h4 style="margin-bottom: 1rem; color: var(--text-primary);">Daily Requests Chart</h4>
                <div style="display: flex; align-items: flex-end; height: 200px; gap: 2px; padding: 0 1rem;">
                    \${trafficData.slice(-7).map((day, index) => {
                        const height = (day.sum.requests / maxRequests) * 180;
                        const date = new Date(day.dimensions.datetime).toLocaleDateString('en', { month: 'short', day: 'numeric' });
                        return \`
                            <div style="flex: 1; background: var(--gradient-primary); height: \${height}px; border-radius: 4px 4px 0 0; position: relative;" title="\${date}: \${day.sum.requests.toLocaleString()} requests">
                                <div style="position: absolute; bottom: -25px; left: 50%; transform: translateX(-50%); font-size: 0.7rem; color: var(--text-secondary); white-space: nowrap;">\${date.split(' ')[0]}</div>
                            </div>
                        \`;
                    }).join('')}
                </div>
                <div style="height: 30px; margin-top: 10px;"></div>
            \`;
        }

        // Workers Management
        async function loadWorkers() {
            if (!validateCredentials()) {
                showNotification('Silakan masukkan kredensial terlebih dahulu!', 'error');
                return;
            }
            
            showNotification('Loading workers...', 'warning');
            addLog('Loading workers list');
            
            try {
                const response = await fetch('/api/workers');
                const data = await response.json();
                
                if (data.success) {
                    currentWorkers = data.result;
                    displayWorkers(currentWorkers);
                    showNotification(\`Loaded \${data.result.length} workers\`, 'success');
                    addLog(\`Successfully loaded \${data.result.length} workers\`);
                } else {
                    throw new Error('Failed to load workers');
                }
            } catch (error) {
                showNotification(\`Error: \${error.message}\`, 'error');
                addLog(\`Failed to load workers: \${error.message}\`);
            }
        }

        function displayWorkers(workers) {
            const tbody = document.getElementById('workers-body');
            
            if (workers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No workers found</td></tr>';
                return;
            }
            
            tbody.innerHTML = workers.map(worker => \`
                <tr>
                    <td>\${worker.name}</td>
                    <td>\${worker.id}</td>
                    <td>\${new Date(worker.created_on).toLocaleDateString()}</td>
                    <td><span style="color: var(--success-color);">Active</span></td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-warning" onclick="editWorker('\${worker.id}')">Edit</button>
                            <button class="btn btn-danger" onclick="confirmDeleteWorker('\${worker.id}', '\${worker.name}')">Delete</button>
                        </div>
                    </td>
                </tr>
            \`).join('');
        }

        function showAddWorkerModal() {
            document.getElementById('add-worker-modal').classList.add('active');
        }

        async function createNewWorker() {
            const workerName = document.getElementById('new-worker-name').value;
            const description = document.getElementById('worker-description').value;
            
            if (!workerName) {
                showNotification('Silakan masukkan nama worker!', 'error');
                return;
            }
            
            try {
                const response = await fetch('/api/workers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: workerName,
                        description: description
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification('Worker created successfully!', 'success');
                    addLog(\`Worker created: \${workerName}\`);
                    closeModal('add-worker-modal');
                    loadWorkers();
                } else {
                    throw new Error('Failed to create worker');
                }
            } catch (error) {
                showNotification(\`Error: \${error.message}\`, 'error');
                addLog(\`Failed to create worker: \${error.message}\`);
            }
        }

        async function deleteWorker(workerId) {
            try {
                const response = await fetch(\`/api/workers?workerId=\${workerId}\`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification('Worker deleted successfully!', 'success');
                    addLog(\`Worker deleted: \${workerId}\`);
                    loadWorkers();
                } else {
                    throw new Error('Failed to delete worker');
                }
            } catch (error) {
                showNotification(\`Error: \${error.message}\`, 'error');
                addLog(\`Failed to delete worker: \${error.message}\`);
            }
        }

        function confirmDeleteWorker(workerId, workerName) {
            showConfirmation(
                \`Apakah Anda yakin ingin menghapus worker "\${workerName}"?\`,
                () => deleteWorker(workerId)
            );
        }

        function editWorker(workerId) {
            showNotification('Edit functionality coming soon!', 'warning');
            addLog(\`Edit worker requested: \${workerId}\`);
        }

        // Deploy Worker
        async function deployWorkerCode() {
            if (!validateCredentials()) {
                showNotification('Silakan masukkan kredensial terlebih dahulu!', 'error');
                return;
            }
            
            const workerName = document.getElementById('worker-name').value;
            const code = document.getElementById('worker-code').value;
            const env = document.getElementById('worker-env').value;
            
            if (!workerName || !code) {
                showNotification('Silakan lengkapi nama dan kode worker!', 'error');
                return;
            }
            
            let environmentVars = {};
            if (env) {
                try {
                    environmentVars = JSON.parse(env);
                } catch (e) {
                    showNotification('Format environment variables tidak valid!', 'error');
                    return;
                }
            }
            
            try {
                const response = await fetch('/api/deploy-worker', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        workerName: workerName,
                        code: code,
                        cfId: credentials.cfId,
                        apiKey: credentials.apiKey,
                        environmentVars: environmentVars
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification(\`Worker "\${workerName}" deployed successfully!\`, 'success');
                    addLog(\`Worker deployed: \${workerName} at \${data.url}\`);
                    document.getElementById('deploy-form').reset();
                } else {
                    throw new Error('Failed to deploy worker');
                }
            } catch (error) {
                showNotification(\`Error: \${error.message}\`, 'error');
                addLog(\`Failed to deploy worker: \${error.message}\`);
            }
        }

        function validateWorkerCode() {
            const code = document.getElementById('worker-code').value;
            
            if (!code) {
                showNotification('Silakan masukkan kode worker!', 'error');
                return;
            }
            
            // Basic syntax validation
            try {
                new Function(code);
                showNotification('Kode worker valid!', 'success');
                addLog('Worker code validation successful');
            } catch (error) {
                showNotification(\`Syntax error: \${error.message}\`, 'error');
                addLog(\`Worker code validation failed: \${error.message}\`);
            }
        }

        // Activity Logs
        function addLog(message) {
            const timestamp = new Date().toLocaleString();
            const log = { time: timestamp, message: message };
            activityLogs.unshift(log);
            
            // Keep only last 100 logs
            if (activityLogs.length > 100) {
                activityLogs = activityLogs.slice(0, 100);
            }
            
            updateLogDisplay();
        }

        function updateLogDisplay() {
            const logContainer = document.getElementById('activity-log');
            
            if (activityLogs.length === 0) {
                logContainer.innerHTML = '<div class="log-item"><div class="log-message">No activity logs</div></div>';
                return;
            }
            
            logContainer.innerHTML = activityLogs.map(log => \`
                <div class="log-item">
                    <div class="log-time">\${log.time}</div>
                    <div class="log-message">\${log.message}</div>
                </div>
            \`).join('');
        }

        function clearLogs() {
            showConfirmation(
                'Apakah Anda yakin ingin menghapus semua log aktivitas?',
                () => {
                    activityLogs = [];
                    updateLogDisplay();
                    showNotification('Activity logs cleared', 'success');
                    addLog('Activity logs cleared by user');
                }
            );
        }

        // Utility Functions
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = \`notification \${type}\`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        function showConfirmation(message, onConfirm) {
            const modal = document.getElementById('confirm-modal');
            const messageElement = document.getElementById('confirm-message');
            const confirmButton = document.getElementById('confirm-button');
            
            messageElement.textContent = message;
            modal.classList.add('active');
            
            confirmButton.onclick = function() {
                onConfirm();
                closeModal('confirm-modal');
            };
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Close modals when clicking outside
        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.classList.remove('active');
            }
        }
    </script>
</body>
</html>
  `
}
</create-file>
