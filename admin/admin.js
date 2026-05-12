// ==================== Supabase 設定 ====================
const SUPABASE_URL = 'https://svmhmo1diygovcswppk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bqQBYKkK3_O1ZrlXa_STgg_lM1Bf7RZ';

let supabase;

// 等待頁面載入完成後初始化 Supabase
document.addEventListener('DOMContentLoaded', () => {
    supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    loadSiteData();
    loadWorks();
});

// ==================== 登入驗證 ====================
if (localStorage.getItem('adminLogin') !== 'ok') {
    location.href = 'login.html';
}

// ==================== 登出 ====================
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('adminLogin');
    location.href = 'login.html';
});

// ==================== 網站設定 ====================
async function loadSiteData() {
    if (!supabase) return;
    const { data, error } = await supabase.from('site').select('*').single();
    if (error) console.error(error);
    if (data) {
        document.getElementById('heroTitle').value = data.heroTitle || '';
        document.getElementById('heroDesc').value = data.heroDesc || '';
        document.getElementById('aboutText').value = data.aboutText || '';
    }
}

document.getElementById('saveSite').addEventListener('click', async () => {
    if (!supabase) return;
    const data = {
        heroTitle: document.getElementById('heroTitle').value,
        heroDesc: document.getElementById('heroDesc').value,
        aboutText: document.getElementById('aboutText').value
    };
    const { error } = await supabase.from('site').update(data).eq('id', 1);
    if (error) alert('儲存失敗：' + error.message);
    else alert('✅ 網站設定已成功儲存！');
});

// ==================== 作品集管理 ====================
async function loadWorks() {
    if (!supabase) return;
    
    const { data, error } = await supabase
        .from('works')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('載入作品失敗:', error);
        document.getElementById('workList').innerHTML = `<p class="text-red-400 p-4">載入失敗: ${error.message}</p>`;
        return;
    }

    let html = '';
    if (!data || data.length === 0) {
        html = '<p class="text-gray-400 p-4">目前沒有作品</p>';
    } else {
        data.forEach(item => {
            html += `
            <div class="p-4 bg-slate-800 rounded-lg flex justify-between items-center">
                <div>
                    <p class="font-bold">${item.title}</p>
                    <p class="text-sm text-gray-400">${item.category || ''}</p>
                </div>
                <button class="delWork px-3 py-1 bg-red-500/20 text-red-400 rounded" data-id="${item.id}">刪除</button>
            </div>`;
        });
    }

    document.getElementById('workList').innerHTML = html;
}

// 新增作品
document.getElementById('addWork').addEventListener('click', async () => {
    if (!supabase) return;
    
    const title = document.getElementById('workTitle').value.trim();
    const category = document.getElementById('workCate').value;
    const img = document.getElementById('workImg').value.trim();
    const desc = document.getElementById('workDesc').value.trim();

    if (!title || !img) {
        alert('請填寫作品名稱與圖片網址');
        return;
    }

    const { error } = await supabase.from('works').insert([{ title, category, img, desc }]);
    
    if (error) {
        alert('新增失敗：' + error.message);
    } else {
        alert('✅ 作品新增成功！');
        document.getElementById('workTitle').value = '';
        document.getElementById('workImg').value = '';
        document.getElementById('workDesc').value = '';
        loadWorks();   // 重新載入列表
    }
});

// 刪除作品
document.getElementById('workList').addEventListener('click', async (e) => {
    if (e.target.classList.contains('delWork')) {
        if (!confirm('確定要刪除此作品嗎？')) return;
        
        const id = e.target.dataset.id;
        const { error } = await supabase.from('works').delete().eq('id', id);
        
        if (error) alert('刪除失敗：' + error.message);
        else loadWorks();
    }
});