import { useState, useRef } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import { useData } from '../../hooks/useData';
import { queryClient } from '../../lib/queryClient';
import { KEYS } from '../../hooks/queries';
import { api } from '../../api';
import { API_BASE_URL } from '../../config';
import Icon from '../ui/Icon';

function invalidateDocs() {
  queryClient.invalidateQueries({ queryKey: KEYS.documents });
}

function invalidateFolders() {
  queryClient.invalidateQueries({ queryKey: KEYS.folders });
}

function UploadFileDialog({ folders, activeFolder, onClose }) {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState(activeFolder?.id ?? folders[0]?.id);
  const [ver, setVer] = useState('1');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef();

  const submit = async () => {
    if (!file || saving) return;
    setSaving(true); setErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folderId', folder);
      fd.append('ver', ver || '1');
      const token = localStorage.getItem('kadchma_token') ?? '';
      const res = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? res.statusText);
      invalidateDocs();
      dispatch({ type: 'SHOW_TOAST', payload: `${file.name} uploaded` });
      onClose();
    } catch (e) { setErr(e.message ?? 'Upload failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', width: 'min(440px,100%)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ background: 'var(--brand)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="plus" size={22} style={{ color: 'var(--on-brand)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--on-brand)' }}>Upload file</div>
            <div style={{ fontSize: 12, color: 'var(--on-brand)', opacity: .75, marginTop: 2 }}>
              {folders.find(f => f.id === folder)?.name ?? 'Select a folder'}
            </div>
          </div>
          <button className="iconbtn" onClick={onClose} style={{ color: 'var(--on-brand)', opacity: .8 }}><Icon name="close" size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{ border: '2px dashed var(--border)', borderRadius: 'var(--r-md)', padding: '24px 16px', textAlign: 'center', cursor: 'pointer', background: file ? 'var(--brand-subtle)' : 'var(--surface-2)' }}
            onClick={() => inputRef.current.click()}
          >
            <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0] ?? null)} />
            {file ? (
              <div>
                <Icon name="doc" size={24} style={{ display: 'block', margin: '0 auto 6px' }} />
                <div style={{ fontWeight: 600, fontSize: 13 }}>{file.name}</div>
                <div className="small muted">{(file.size / 1024).toFixed(0)} KB</div>
              </div>
            ) : (
              <div>
                <Icon name="plus" size={24} style={{ display: 'block', margin: '0 auto 6px', opacity: 0.4 }} />
                <div className="small muted">Click to choose a file</div>
              </div>
            )}
          </div>
          <FW label="Folder">
            <select value={folder} onChange={e => setFolder(e.target.value)} style={IST}>
              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </FW>
          <FW label="Version">
            <input value={ver} onChange={e => setVer(e.target.value)} placeholder="1" style={{ ...IST, width: 80 }} />
          </FW>
          {err && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{err}</div>}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <button className="btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn pri" onClick={submit} disabled={!file || saving}>
            <Icon name="plus" size={16} /> {saving ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

const IST = { fontSize: 13, padding: '7px 10px', height: 34, width: '100%', boxSizing: 'border-box' };

function FW({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
      {children}
    </label>
  );
}

function NewFolderDialog({ myDept, onClose }) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [zone, setZone] = useState('org');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true); setErr('');
    try {
      await api.post('/folders', { name: name.trim(), zone, dept: zone === 'dept' ? myDept : '' });
      invalidateFolders();
      dispatch({ type: 'SHOW_TOAST', payload: `Folder "${name.trim()}" created` });
      onClose();
    } catch (e) { setErr(e.message ?? 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', width: 'min(440px,100%)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ background: 'var(--brand)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="folder" size={22} style={{ color: 'var(--on-brand)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--on-brand)' }}>New folder</div>
            <div style={{ fontSize: 12, color: 'var(--on-brand)', opacity: .75, marginTop: 2 }}>
              {zone === 'dept' ? `Department folder · ${myDept}` : 'Organisation-wide folder'}
            </div>
          </div>
          <button className="iconbtn" onClick={onClose} style={{ color: 'var(--on-brand)', opacity: .8 }}><Icon name="close" size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FW label="Folder name *">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Legal Documents" style={IST} autoFocus />
          </FW>
          <FW label="Zone">
            <select value={zone} onChange={e => setZone(e.target.value)} style={IST}>
              <option value="org">Organisation</option>
              <option value="dept">Department ({myDept})</option>
            </select>
          </FW>
          {err && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{err}</div>}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <button className="btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn pri" onClick={submit} disabled={!name.trim() || saving}>
            <Icon name="plus" size={16} /> {saving ? 'Creating…' : 'Create folder'}
          </button>
        </div>
      </div>
    </div>
  );
}

const FILE_ICONS = {
  pdf: 'doc',
  xlsx: 'doc',
  xls: 'doc',
  docx: 'doc',
  doc: 'doc',
  jpg: 'eye',
  jpeg: 'eye',
  png: 'eye',
};

function fileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function Documents() {
  const { me, dmsFolder } = useApp();
  const dispatch = useDispatch();
  const data = useData();
  const [showUpload, setShowUpload] = useState(false);
  const [showFolder, setShowFolder] = useState(false);

  const user = data.staff.find(s => s.id === me);
  const myDept = user?.dept ?? '';

  const orgFolders = data.folders.filter(f => f.zone === 'org');
  const deptFolders = data.folders.filter(f => f.zone === 'dept' && (!f.dept || f.dept === myDept));
  const folders = [...orgFolders, ...deptFolders];
  const activeFolder = folders.find(f => f.id === dmsFolder) ?? folders[0];
  const activeFolderFiles = (data.files ?? []).filter(f => f.folder === activeFolder?.id);

  return (
    <>
      {showFolder && <NewFolderDialog myDept={myDept} onClose={() => setShowFolder(false)} />}
      {showUpload && (
        <UploadFileDialog
          folders={folders}
          activeFolder={activeFolder}
          onClose={() => setShowUpload(false)}
        />
      )}
      <div className="phead">
        <div>
          <span className="overline">DMS</span>
          <h1>Documents</h1>
        </div>
        <div className="row">
          <button className="btn sec" onClick={() => setShowFolder(true)}>
            <Icon name="folder" size={16} /> New folder
          </button>
          <button className="btn pri" onClick={() => setShowUpload(true)}>
            <Icon name="plus" size={16} /> Upload file
          </button>
        </div>
      </div>

      <div className="dms" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--s6)' }}>
        <div className="card" style={{ padding: 'var(--s3)' }}>
          <div className="tree">
            <div className="zone overline">Organisation</div>
            {orgFolders.map(f => (
              <button
                key={f.id}
                className={dmsFolder === f.id ? 'on' : ''}
                onClick={() => dispatch({ type: 'SET_DMS_FOLDER', payload: f.id })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--s2)',
                  border: 0, background: dmsFolder === f.id ? 'var(--brand-subtle)' : 'none',
                  padding: '7px var(--s2)', borderRadius: 'var(--r-sm)',
                  font: '600 14px var(--sans)', color: dmsFolder === f.id ? 'var(--on-brand-subtle)' : 'var(--ink)',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                }}
              >
                <Icon name="folder" size={16} />
                {f.name}
              </button>
            ))}
            {deptFolders.length > 0 && (
              <>
                <div className="zone overline" style={{ marginTop: 'var(--s3)' }}>Departments</div>
                {deptFolders.map(f => (
                  <button
                    key={f.id}
                    className={dmsFolder === f.id ? 'on' : ''}
                    onClick={() => dispatch({ type: 'SET_DMS_FOLDER', payload: f.id })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--s2)',
                      border: 0, background: dmsFolder === f.id ? 'var(--brand-subtle)' : 'none',
                      padding: '7px var(--s2)', borderRadius: 'var(--r-sm)',
                      font: '600 14px var(--sans)', color: dmsFolder === f.id ? 'var(--on-brand-subtle)' : 'var(--ink)',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                    }}
                  >
                    <Icon name="folder" size={16} />
                    {f.name}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="card flush">
          <div className="chead">
            <h3>{activeFolder?.name}</h3>
            <span className="small muted">{activeFolderFiles.length} file{activeFolderFiles.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>File name</th>
                  <th>Uploaded by</th>
                  <th>Date</th>
                  <th>Size</th>
                  <th>Version</th>
                </tr>
              </thead>
              <tbody>
                {activeFolderFiles.length === 0 && (
                  <tr><td colSpan={5} className="empty">No files in this folder yet.</td></tr>
                )}
                {activeFolderFiles.map(f => {
                  const ext = f.name.split('.').pop().toLowerCase();
                  const uploaderName = typeof f.by === 'object' ? f.by?.name : (data.staff.find(s => s.id === f.by)?.name ?? '—');
                  return (
                    <tr key={f.id} className={f.fileUrl ? 'click' : ''} onClick={() => f.fileUrl && window.open(f.fileUrl, '_blank')}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
                          <Icon name={FILE_ICONS[ext] ?? 'doc'} size={16} style={{ color: 'var(--brand-text)' }} />
                          <span style={{ fontWeight: 600 }}>{f.name}</span>
                        </div>
                      </td>
                      <td>{uploaderName || '—'}</td>
                      <td className="small muted">{f.uploaded}</td>
                      <td className="small muted">{fileSize(f.size)}</td>
                      <td><span className="tag">v{f.ver}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
