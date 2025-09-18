import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PhoneIcon, AddIcon, EditIcon, DeleteIcon } from '../constants';
import { useAppContext } from '../context/AppContext';
import { EmergencyContact } from '../types';

const verifiedHelplines = [
    { nameKey: 'helpline_kiran_name', orgKey: 'helpline_kiran_org', number: '1800-599-0019', tel: '18005990019', color: 'blue' },
    { nameKey: 'helpline_vandrevala_name', orgKey: 'helpline_vandrevala_org', number: '1860 2662 345', tel: '18602662345', color: 'blue' },
    { nameKey: 'helpline_icall_name', orgKey: 'helpline_icall_org', number: '9152987821', tel: '9152987821', color: 'red' },
    { nameKey: 'helpline_snehi_name', orgKey: 'helpline_snehi_org', number: '+91 9582208181', tel: '+919582208181', color: 'blue' },
    { nameKey: 'helpline_aasra_name', orgKey: 'helpline_aasra_org', number: '+91 98204 66726', tel: '+919820466726', color: 'blue' },
];

const ContactModal: React.FC<{
    contact: EmergencyContact | null;
    onClose: () => void;
}> = ({ contact, onClose }) => {
    const { t } = useTranslation();
    const { addEmergencyContact, updateEmergencyContact, triggerHapticFeedback } = useAppContext();
    const [name, setName] = useState(contact?.name || '');
    const [relationship, setRelationship] = useState(contact?.relationship || '');
    const [phone, setPhone] = useState(contact?.phone || '');
    const isEditing = !!contact;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) return;

        if (isEditing) {
            updateEmergencyContact({ ...contact, name, relationship, phone });
        } else {
            addEmergencyContact({ name, relationship, phone });
        }
        triggerHapticFeedback('medium');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[var(--bg-surface)] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-[var(--text-secondary)]">&times;</button>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{t(isEditing ? 'contact_modal_edit_title' : 'contact_modal_add_title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="font-semibold text-sm text-[var(--text-secondary)]">{t('contact_modal_name_label')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('contact_modal_name_placeholder')} className="w-full p-3 mt-1 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)]" required />
                    </div>
                     <div>
                        <label className="font-semibold text-sm text-[var(--text-secondary)]">{t('contact_modal_relationship_label')}</label>
                        <input type="text" value={relationship} onChange={e => setRelationship(e.target.value)} placeholder={t('contact_modal_relationship_placeholder')} className="w-full p-3 mt-1 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)]" />
                    </div>
                     <div>
                        <label className="font-semibold text-sm text-[var(--text-secondary)]">{t('contact_modal_phone_label')}</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('contact_modal_phone_placeholder')} className="w-full p-3 mt-1 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)]" required />
                    </div>
                    <button type="submit" className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--text-on-accent)] font-bold py-3 px-6 rounded-lg transition mt-4">
                       {t('contact_modal_save_button')}
                    </button>
                </form>
            </div>
        </div>
    );
};

const CrisisBanner: React.FC<{onCall: (tel: string) => void}> = ({ onCall }) => {
    const { t } = useTranslation();
    return (
        <div className="sticky top-0 bg-[var(--danger-surface)] p-4 text-center z-30 shadow-lg animate-fade-in">
            <h2 className="text-xl font-bold text-[var(--danger-text)] uppercase">{t('crisis_banner_urgent_help')}</h2>
            <p className="text-[var(--danger-text)] mt-1">{t('crisis_banner_subtitle')}</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                 <button onClick={() => onCall('9152987821')} className="flex-1 bg-[var(--danger-primary)] hover:bg-[var(--danger-secondary)] text-white font-bold py-3 px-4 rounded-lg border-2 animate-flashing-border">
                    {t('crisis_banner_call_now_button')} (iCALL)
                </button>
                 <button onClick={() => onCall('18005990019')} className="flex-1 bg-white text-[var(--danger-primary)] font-bold py-3 px-4 rounded-lg border-2 border-[var(--danger-primary)] hover:bg-red-50">
                    {t('helpline_kiran_name')}
                </button>
            </div>
        </div>
    );
}

const Emergency: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { emergencyContacts, logEmergencyAction, deleteEmergencyContact, user, triggerHapticFeedback } = useAppContext();
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

    const fromDistress = location.state?.fromDistress === true;

    const handleCall = (tel: string) => {
        logEmergencyAction('helpline_tap');
        window.location.href = `tel:${tel}`;
    };

    const openModal = (contact: EmergencyContact | null = null) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {fromDistress && <CrisisBanner onCall={handleCall} />}
            {isModalOpen && <ContactModal contact={editingContact} onClose={() => setIsModalOpen(false)} />}
            <div className="max-w-3xl mx-auto p-4 sm:p-8">
                <button onClick={() => navigate(-1)} className="mb-8 text-[var(--text-accent)] font-semibold">&larr; {t('go_back')}</button>
                
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-[var(--danger-secondary)]">{t('emergency_header_title')}</h1>
                    <p className="text-[var(--text-secondary)] mt-2 max-w-lg mx-auto">{t('emergency_header_subtitle')}</p>
                    <p className="text-[var(--text-secondary)] mt-1">{t('emergency_header_extra')}</p>
                </div>

                {!user?.isAnonymous && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('my_contacts_title')}</h2>
                        <p className="text-[var(--text-secondary)] mb-4">{t('my_contacts_desc')}</p>
                        <div className="space-y-3">
                            {emergencyContacts.map(contact => (
                                <div key={contact.id} className="bg-[var(--bg-surface)] p-4 rounded-lg shadow-md flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold text-xl">{contact.name.charAt(0)}</div>
                                        <div>
                                            <p className="font-semibold text-green-800 dark:text-green-200">{contact.name}</p>
                                            <p className="text-sm text-green-600 dark:text-green-300">{contact.relationship}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openModal(contact)} className="p-2 hover:bg-black/10 rounded-full"><EditIcon /></button>
                                        <button onClick={() => { deleteEmergencyContact(contact.id); triggerHapticFeedback('light'); }} className="p-2 hover:bg-black/10 rounded-full"><DeleteIcon /></button>
                                        <button onClick={() => handleCall(contact.phone)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2">
                                            <PhoneIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {emergencyContacts.length < 3 && (
                                <button onClick={() => openModal(null)} className="w-full text-center p-4 border-2 border-dashed border-[var(--border-primary)] rounded-lg text-[var(--text-accent)] font-semibold hover:bg-[var(--bg-muted)]">
                                    <AddIcon /> {t('add_contact_button')}
                                </button>
                            )}
                        </div>
                    </section>
                )}
                
                <section>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('verified_helplines_title')}</h2>
                    <p className="text-[var(--text-secondary)] mb-4">{t('verified_helplines_desc')}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                        {verifiedHelplines.map(helpline => (
                             <div key={helpline.nameKey} className={`p-4 rounded-lg shadow-md ${helpline.color === 'red' ? 'bg-red-100 dark:bg-red-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                                <p className={`font-bold ${helpline.color === 'red' ? 'text-red-800 dark:text-red-200' : 'text-blue-800 dark:text-blue-200'}`}>{t(helpline.nameKey)}</p>
                                <p className={`text-sm mb-3 ${helpline.color === 'red' ? 'text-red-600 dark:text-red-300' : 'text-blue-600 dark:text-blue-300'}`}>{t(helpline.orgKey)}</p>
                                <p className="text-lg font-semibold mb-3">{helpline.number}</p>
                                <button onClick={() => handleCall(helpline.tel)} className={`w-full font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 ${helpline.color === 'red' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
                                   <PhoneIcon /> {t('helpline_call_now')}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Emergency;