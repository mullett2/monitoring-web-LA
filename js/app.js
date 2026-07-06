import { db } from './firebase-config.js';

import {
  ref,
  onValue,
  set,
  update,
  remove,
  get
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

//variabel
let editMode = '';
let uidLama = '';

//convert hari
function getNamaHari(hari) {
    const hariList = [
        'Minggu',
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu'
    ];

    return hariList[hari];
}

const tbodyLog =
document.getElementById('tbodyLog');

//conert jam
function timeToMinutes(time) {
    const [jam, menit] = time.split(':');

    return parseInt(jam) * 60 +
           parseInt(menit);
}

function minutesToTime(total) {
    const jam =
        Math.floor(total / 60)
        .toString()
        .padStart(2, '0');

    const menit =
        (total % 60)
        .toString()
        .padStart(2, '0');

    return `${jam}:${menit}`;
}

//delete
window.hapusMahasiswa = function(uid){

    if(confirm('Hapus data mahasiswa?')){

        remove(
            ref(db, 'mahasiswa/' + uid)
        );
    }
}

//edit
window.editMahasiswa = async function(uid) {

    const snapshot = await get(
        ref(db, 'mahasiswa/' + uid)
    );

    if (!snapshot.exists()) {
        alert('Data mahasiswa tidak ditemukan');
        return;
    }

    const data = snapshot.val();

    formMode = 'edit';
    uidLama = uid;

    document.getElementById('uid').value = uid;
    document.getElementById('nama').value = data.nama ?? '';
    document.getElementById('nim').value = data.nim ?? '';
    document.getElementById('hari').value = data.hari ?? 1;
    document.getElementById('mulai').value =
        minutesToTime(data.mulai ?? 0);
    document.getElementById('selesai').value =
        minutesToTime(data.selesai ?? 0);
    document.getElementById('status').value =
        data.status ?? 'aktif';

    document
        .getElementById('modalMahasiswa')
        .classList.remove('hidden');
};

window.daftarRfid = async function(uid) {

    const snapshot = await get(
        ref(db, 'mahasiswa/' + uid)
    );

    if (snapshot.exists()) {
        alert('UID ini sudah terdaftar');

        showPage('mahasiswa');
        return;
    }

    formMode = 'daftar';
    uidLama = uid;

    document.getElementById('formMahasiswa').reset();

    document.getElementById('uid').value = uid;
    document.getElementById('hari').value = '1';
    document.getElementById('status').value = 'aktif';

    document
        .getElementById('modalMahasiswa')
        .classList.remove('hidden');
};

// Pindah halaman
window.showPage = function(page) {
  document.getElementById('dashboardPage')
    .classList.add('hidden');

  document.getElementById('mahasiswaPage')
    .classList.add('hidden');

  if (page === 'dashboard') {
    document.getElementById('dashboardPage')
      .classList.remove('hidden');
    }

  if (page === 'mahasiswa') {
    document.getElementById('mahasiswaPage')
      .classList.remove('hidden');
    }  
};

const tbody =
  document.getElementById('tbodyMahasiswa');

onValue(ref(db, 'mahasiswa'), (snapshot) => {

  tbody.innerHTML = '';

  let total = 0;

    snapshot.forEach((child) => {
        total++;

        const uid = child.key;
        const data = child.val();

        tbody.innerHTML += `
            <tr class="border-b hover:bg-slate-50 transition">
                <td class="p-4 font-medium">${uid}</td>

                <td class="p-4">
                    ${data.nama}
                </td>

                <td class="p-4">
                    ${data.nim}
                </td>

                <td class="p-4">
                    ${getNamaHari(data.hari)}
                </td>

                <td class="p-4">
                    ${minutesToTime(data.mulai)}
                    -
                    ${minutesToTime(data.selesai)}
                </td>

                <td class="p-4">
                    <div class="flex gap-2 justify-center">

                        <button
                            onclick="editMahasiswa('${uid}')"
                            class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg">
                            Edit
                        </button>

                        <button
                            onclick="hapusMahasiswa('${uid}')"
                            class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg">
                            Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

  document.getElementById('totalMahasiswa')
    .innerText = total;
});

onValue(ref(db, 'log_akses'), (snapshot) => {

    tbodyLog.innerHTML = '';

    const logs = [];

    let aksesHariIni = 0;
    let aksesDitolak = 0;

    const hariIni = new Date();

    const tanggalHariIni =
        String(hariIni.getDate()).padStart(2, '0') +
        '-' +
        String(hariIni.getMonth() + 1).padStart(2, '0') +
        '-' +
        hariIni.getFullYear();

    snapshot.forEach((child) => {
        const log = child.val();
        logs.push(log);
        if (log.waktu) {

            const tanggalLog =
                log.waktu.substring(0, 10);

            if (tanggalLog === tanggalHariIni) {

                aksesHariIni++;

                if (log.status === 'DITOLAK') {
                    aksesDitolak++;
                }
            }
        }
    });

    document.getElementById('aksesHariIni')
    .innerText = aksesHariIni;

    document.getElementById('aksesDitolak')
    .innerText = aksesDitolak;

    logs.reverse();
    logs.slice(0, 15).forEach((log) => {

        tbodyLog.innerHTML += `
            <tr class="border-b hover:bg-slate-50">

                <td class="p-3">
                    ${log.waktu ?? '-'}
                </td>

                <td class="p-3">
                    ${log.nama}
                </td>

                <td class="p-3">
                    ${log.uid}
                </td>

                <td class="p-3">

                    <span
                    class="
                    px-3 py-1 rounded-full
                    ${
                        log.status === 'DISETUJUI'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }
                    ">
                        ${log.status}
                    </span>
                </td>

                <td class="p-3">

                    ${
                        log.status === 'BELUM TERDAFTAR'
                        ? `
                            <button
                                onclick="daftarRfid('${log.uid}')"
                                class="bg-blue-600 hover:bg-blue-700
                                    text-white px-3 py-2 rounded-lg">
                                Daftar
                            </button>
                        `
                        : '-'
                    }

                </td>

            </tr>
        `;
    });
});


document.getElementById('formMahasiswa')
.addEventListener('submit', async (e) => {

    e.preventDefault();

    const uid = uidLama;

    const nama =
        document.getElementById('nama')
        .value
        .trim();

    const nim =
        document.getElementById('nim')
        .value
        .trim();

    const hari =
        parseInt(
            document.getElementById('hari').value
        );

    const mulaiValue =
        document.getElementById('mulai').value;

    const selesaiValue =
        document.getElementById('selesai').value;

    const status =
        document.getElementById('status').value;


    // VALIDASI

    if (nama === '' || nim === '') {
        alert('Nama dan NIM wajib diisi');
        return;
    }

    if (mulaiValue === '' || selesaiValue === '') {
        alert('Jam mulai dan selesai wajib diisi');
        return;
    }


    const mulai =
        timeToMinutes(mulaiValue);

    const selesai =
        timeToMinutes(selesaiValue);


    // SIMPAN DATA

    await update(
        ref(db, 'mahasiswa/' + uid),
        {
            nama,
            nim,
            hari,
            mulai,
            selesai,
            status
        }
    );


    if (formMode === 'daftar') {

        alert('RFID berhasil didaftarkan');

    } else {

        alert('Data mahasiswa berhasil diperbarui');

    }


    document
        .getElementById('modalMahasiswa')
        .classList.add('hidden');

    document
        .getElementById('formMahasiswa')
        .reset();

    formMode = '';
    uidLama = '';
});

document.getElementById('btnTutup')
.addEventListener('click', () => {

    document
        .getElementById('modalMahasiswa')
        .classList.add('hidden');

    document
        .getElementById('formMahasiswa')
        .reset();

    formMode = '';
    uidLama = '';
});

document.getElementById('search')
    .addEventListener('keyup',
        function(){
            const keyword =
            this.value.toLowerCase();

            const rows =
            document.querySelectorAll(
                '#tbodyMahasiswa tr'
            );

            rows.forEach(row=>{

                const text =
                row.innerText.toLowerCase();

                row.style.display =
                text.includes(keyword)
                ? ''
                : 'none';
            });
        });

document.getElementById('btnTambah')
    .addEventListener('click', () => {

        document
            .getElementById('modalTambahRfid')
            .classList.remove('hidden');
    });

document.getElementById('btnTutupTambah')
    .addEventListener('click', () => {

        document
            .getElementById('modalTambahRfid')
            .classList.add('hidden');
    });

document.getElementById('formTambahRfid')
.addEventListener('submit',
async (e) => {

    e.preventDefault();

    const uid =
        document
            .getElementById('uidBaru')
            .value
            .trim();

    if(uid === ''){
        alert('UID kosong');
        return;
    }

    const snapshot =
        await get(
            ref(db, 'mahasiswa/' + uid)
        );

    if(snapshot.exists()){
        alert('UID sudah terdaftar');
        return;
    }

    await update(
        ref(db, 'mahasiswa/' + uid),
        {
            nama: '-',
            nim: '-',
            hari: 0,
            mulai: 0,
            selesai: 0
        }
    );

    alert('RFID berhasil ditambahkan');

    document
        .getElementById('formTambahRfid')
        .reset();

    document
        .getElementById('modalTambahRfid')
        .classList.add('hidden');

});