import { supabase } from './supabaseConfig.js';

// ── Auth guard ─────────────────────────────────────────────────
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'home.html';
    }
}
checkAuth();

// ── Load profile on page load ──────────────────────────────────
async function loadUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

    if (profile) {
        const avatar = profile.avatar_url || 'img/profile-img.jpg';
        document.getElementById('mainAvatar').src = avatar;
        document.getElementById('avatarPreview').src = avatar;
        document.getElementById('profile-username').textContent = profile.username;
    }
}

// ── Open / Close modal ─────────────────────────────────────────
function openSettingsModal() {
    document.getElementById('settingsModal').style.display = 'flex';
}
function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}
document.getElementById('settingsModal').addEventListener('click', function (e) {
    if (e.target === this) closeSettingsModal();
});

// ── Toast helper ───────────────────────────────────────────────
function showToast(msg, type = 'success') {
    const t = document.getElementById('settingsToast');
    t.textContent = msg;
    t.className = `settings-toast ${type}`;
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3500);
}

// ── Avatar preview (before upload) ────────────────────────────
function previewAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => document.getElementById('avatarPreview').src = e.target.result;
    reader.readAsDataURL(file);
}

// ── Upload Avatar ──────────────────────────────────────────────
async function uploadAvatar() {
    const file = document.getElementById('avatarInput').files[0];
    if (!file) return showToast('No file selected.', 'error');

    const { data: { user } } = await supabase.auth.getUser();
    console.log('User ID:', user.id); // ← check this

    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

    console.log('Upload result:', uploadData, uploadError); // ← check this

    if (uploadError) return showToast(uploadError.message, 'error');

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    console.log('Public URL:', publicUrl); // ← check this

    const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

    console.log('DB update result:', updateData, updateError); // ← check this

    if (updateError) return showToast(updateError.message, 'error');

    document.getElementById('avatarPreview').src = publicUrl;
    document.getElementById('mainAvatar').src = publicUrl;
    showToast('Avatar updated!');
}

// ── Update Nickname ────────────────────────────────────────────
async function updateNickname() {
    const nickname = document.getElementById('nicknameInput').value.trim();
    if (!nickname) return showToast('Nickname cannot be empty.', 'error');

    const { data: { user } } = await supabase.auth.getUser();

    // ← Check if it's the same as current nickname
    const currentUsername = document.getElementById('profile-username').textContent;
    if (nickname === currentUsername) return showToast('This is already your nickname!', 'error');

    // ← Check if nickname already taken by someone else
    const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', nickname)
        .neq('id', user.id)
        .single();

    if (existing) return showToast('Nickname already taken!', 'error');

    const { error } = await supabase
        .from('profiles')
        .update({ username: nickname })
        .eq('id', user.id);

    if (error) return showToast(error.message, 'error');

    document.getElementById('profile-username').textContent = nickname;
    showToast('Nickname updated!');
}

// ── Update Email ───────────────────────────────────────────────
async function updateEmail() {
    const email = document.getElementById('emailInput').value.trim();
    if (!email) return showToast('Email cannot be empty.', 'error');
    if (!email.includes('@')) return showToast('Invalid email address.', 'error'); 


    const { data: { user } } = await supabase.auth.getUser();

    // Update in Supabase auth
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return showToast(error.message, 'error');

    // Also update in profiles table
    await supabase
        .from('profiles')
        .update({ email: email })
        .eq('id', user.id);

    showToast('Confirmation sent to new email.');
}

// ── Update Password ────────────────────────────────────────────
async function updatePassword() {
    const pw = document.getElementById('newPasswordInput').value;
    const cpw = document.getElementById('confirmPasswordInput').value;
    if (!pw) return showToast('Password cannot be empty.', 'error');
    if (pw !== cpw) return showToast('Passwords do not match.', 'error');
    if (pw.length < 6) return showToast('Minimum 6 characters.', 'error');

    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return showToast(error.message, 'error');
    showToast('Password updated!');
}

// ── Wire up the Settings button ────────────────────────────────
document.querySelector('.btn.btn-outline-light').addEventListener('click', openSettingsModal);

// ── Init ───────────────────────────────────────────────────────
loadUserProfile();

// Add these at the bottom of modal.js
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.previewAvatar = previewAvatar;
window.uploadAvatar = uploadAvatar;
window.updateNickname = updateNickname;
window.updateEmail = updateEmail;
window.updatePassword = updatePassword;