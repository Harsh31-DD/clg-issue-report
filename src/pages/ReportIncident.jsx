import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight, Upload, X, AlertTriangle, Shield, CheckCircle2, Loader2, Sparkles, PencilLine } from 'lucide-react';
import { Button, Input, GlassyCard, useToast } from '../components/UI';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Water', 'Electricity', 'Cleanliness', 'Wi-Fi', 'Maintenance'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const ROLES = [
    { label: 'Student', value: 'student' },
    { label: 'Teaching Staff', value: 'teaching' },
    { label: 'Non-Teaching Staff', value: 'non_teaching' }
];

const DEPARTMENTS = [
    'General',
    'IT Services',
    'Estate Management',
    'Student Affairs',
    'Security',
    'Library'
];

export const ReportIncident = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [files, setFiles] = useState([]);
    const { addToast } = useToast();
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Maintenance',
        priority: 'Medium',
        location: '',
        is_anonymous: false,
        reporter_role: 'student',
        department: 'General'
    });

    const updateField = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const validFiles = newFiles.filter(file => {
                const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
                return validTypes.includes(file.type);
            });

            if (validFiles.length !== newFiles.length) {
                addToast('Only PNG and JPG images are allowed.', 'error');
            }

            setFiles(prev => [...prev, ...validFiles]);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            setError('A subject/title is required for the report.');
            return;
        }
        if (!formData.description.trim()) {
            setError('Detail log is required for transmission.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // STEP 1: Create Issue
            const { data: issue, error: issueError } = await supabase
                .from('issues')
                .insert({
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    priority: formData.priority,
                    location: formData.location,
                    is_anonymous: formData.is_anonymous,
                    reporter_role: formData.reporter_role,
                    department: formData.department,
                    reported_by: formData.is_anonymous || !user ? null : user.id,
                    status: 'Submitted',
                    status_updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (issueError) throw issueError;
            if (!issue) throw new Error('Failed to create issue');

            // STEP 2: Upload Images
            if (files.length > 0) {
                for (const file of files) {
                    try {
                        const fileExt = file.name.split('.').pop();
                        const timestamp = Date.now();
                        const filePath = `${issue.id}/${timestamp}.${fileExt}`;

                        await supabase.storage
                            .from('issue-images')
                            .upload(filePath, file);

                        await supabase.from('issue_images').insert({
                            issue_id: issue.id,
                            image_path: filePath
                        });
                    } catch (uploadErr) {
                        console.error('[Storage] Upload failed (continuing):', uploadErr);
                    }
                }
            }

            // STEP 3: Success State
            setLoading(false);
            setIsSubmitted(true);
            addToast('Incident successfully logged.', 'success');

            // STEP 4: Navigate after animation completes
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 2500);

        } catch (err) {
            console.error('[ReportIncident] Submission error:', err);
            setError(err.message || 'Transmission failure. Please try again.');
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 2 && (!formData.description.trim() || !formData.title.trim())) {
            setError('Please provide a title and incident details.');
            return;
        }
        setError(null);
        setStep(s => s + 1);
    };

    const prevStep = () => {
        setError(null);
        setStep(s => s - 1);
    };

    if (isSubmitted) {
        return (
            <div style={{
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ textAlign: 'center', maxWidth: '480px' }}
                >
                    <GlassyCard style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ position: 'relative' }}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)'
                                }}
                            >
                                <CheckCircle2 size={50} color="white" />
                            </motion.div>
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0, 0.5]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: '50%',
                                    border: '4px solid #10b981',
                                    pointerEvents: 'none'
                                }}
                            />
                        </div>

                        <div>
                            <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'white', margin: '0 0 12px 0', fontFamily: 'Outfit' }}>Case Transmitted</h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', lineHeight: 1.5, margin: 0 }}>
                                Your report has been successfully logged into the campus registry. Administrative review will commence shortly.
                            </p>
                        </div>

                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 2.5, ease: "linear" }}
                                style={{ height: '100%', background: '#10b981' }}
                            />
                        </div>

                        <p style={{ color: 'rgba(16, 185, 129, 0.6)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Redirecting to Dashboard...
                        </p>
                    </GlassyCard>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'max(20px, 4vw)', width: '100%' }}>
            <GlassyCard glow style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '40px',
                padding: 'max(40px, 6vw)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(253, 161, 54, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FDA136', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                            <Sparkles size={14} />
                            Neural Link Active
                        </div>
                        <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: '900', color: 'white', margin: 0, fontFamily: 'Outfit', letterSpacing: '-1px' }}>
                            File Incident Report
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                    height: '4px',
                                    width: '40px',
                                    borderRadius: '2px',
                                    background: i <= step ? 'linear-gradient(90deg, #E65A1F, #FDA136)' : 'rgba(255,255,255,0.05)',
                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                }} />
                            ))}
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(220, 38, 38, 0.1)',
                                border: '1px solid rgba(220, 38, 38, 0.2)',
                                color: '#f87171',
                                fontSize: '13px',
                                textAlign: 'center',
                                fontWeight: 500
                            }}
                        >
                            <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ position: 'relative', minHeight: '300px' }}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Entity Role Verification</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                        {ROLES.map((r) => (
                                            <button
                                                key={r.value}
                                                onClick={() => updateField('reporter_role', r.value)}
                                                style={{
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    border: '1px solid',
                                                    borderColor: formData.reporter_role === r.value ? '#FDA136' : 'rgba(255, 255, 255, 0.05)',
                                                    background: formData.reporter_role === r.value ? 'rgba(253, 161, 54, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                                    color: formData.reporter_role === r.value ? 'white' : 'rgba(255, 255, 255, 0.4)',
                                                    fontSize: '13px',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Registry Category</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => updateField('category', cat)}
                                                style={{
                                                    padding: '10px 18px',
                                                    borderRadius: '20px',
                                                    border: '1px solid',
                                                    borderColor: formData.category === cat ? '#FDA136' : 'rgba(255, 255, 255, 0.08)',
                                                    background: formData.category === cat ? 'rgba(253, 161, 54, 0.1)' : 'transparent',
                                                    color: formData.category === cat ? 'white' : 'rgba(255, 255, 255, 0.4)',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target Department</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                                        {DEPARTMENTS.map(dept => (
                                            <button
                                                key={dept}
                                                onClick={() => updateField('department', dept)}
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '12px',
                                                    border: '1px solid',
                                                    borderColor: formData.department === dept ? '#FDA136' : 'rgba(255, 255, 255, 0.05)',
                                                    background: formData.department === dept ? 'rgba(253, 161, 54, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                                                    color: formData.department === dept ? 'white' : 'rgba(255, 255, 255, 0.4)',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {dept}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={nextStep} style={{ height: '56px', marginTop: '8px' }}>Initiate Step 2 <ChevronRight size={20} /></Button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Report Subject</label>
                                    <div style={{ position: 'relative' }}>
                                        <PencilLine style={{ position: 'absolute', left: '16px', top: '18px', color: 'rgba(253, 161, 54, 0.4)' }} size={18} />
                                        <Input
                                            style={{ paddingLeft: '48px', height: '54px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            placeholder="Short summary of the issue..."
                                            value={formData.title}
                                            onChange={(e) => updateField('title', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Observation Logs</label>
                                    <textarea
                                        style={{
                                            width: '100%',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            color: 'white',
                                            minHeight: '140px',
                                            outline: 'none',
                                            resize: 'vertical',
                                            fontSize: '16px',
                                            fontFamily: 'inherit',
                                            lineHeight: 1.6
                                        }}
                                        placeholder="Provide a comprehensive breakdown of the observed incident..."
                                        value={formData.description}
                                        onChange={(e) => updateField('description', e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Coordinates (Location)</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin style={{ position: 'absolute', left: '16px', top: '18px', color: 'rgba(253, 161, 54, 0.4)' }} size={18} />
                                        <Input
                                            style={{ paddingLeft: '48px', height: '54px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            placeholder="e.g. Sector-7, Laboratory Gamma"
                                            value={formData.location}
                                            onChange={(e) => updateField('location', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                    <Button variant="secondary" onClick={prevStep} style={{ flex: 1, height: '54px' }}>Back</Button>
                                    <Button onClick={nextStep} style={{ flex: 2, height: '54px' }}>Continue To Evidence</Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Visual Data Acquisition</label>
                                    <div
                                        style={{
                                            padding: '40px 20px',
                                            border: '2px dashed rgba(253, 161, 54, 0.2)',
                                            borderRadius: '16px',
                                            textAlign: 'center',
                                            background: 'rgba(253, 161, 54, 0.01)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(253, 161, 54, 0.4)';
                                            e.currentTarget.style.background = 'rgba(253, 161, 54, 0.03)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(253, 161, 54, 0.2)';
                                            e.currentTarget.style.background = 'rgba(253, 161, 54, 0.01)';
                                        }}
                                    >
                                        <Upload size={32} color="#FDA136" style={{ margin: '0 auto 16px' }} />
                                        <p style={{ color: 'white', fontSize: '15px', margin: 0, fontWeight: 700 }}>Inject Visual Evidence</p>
                                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '6px' }}>Standard PNG/JPG formats only</p>
                                        <input id="file-upload" type="file" multiple hidden onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" />
                                    </div>
                                    {files.length > 0 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px', marginTop: '8px' }}>
                                            {files.map((file, idx) => (
                                                <div key={idx} style={{
                                                    position: 'relative',
                                                    aspectRatio: '1',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    border: '1px solid rgba(255,255,255,0.08)'
                                                }}>
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt="preview"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '6px',
                                                            right: '6px',
                                                            width: '24px',
                                                            height: '24px',
                                                            borderRadius: '50%',
                                                            background: 'rgba(0,0,0,0.6)',
                                                            backdropFilter: 'blur(4px)',
                                                            border: 'none',
                                                            color: 'white',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Transmission Protocols</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <button
                                            onClick={() => updateField('is_anonymous', !formData.is_anonymous)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                padding: '18px',
                                                borderRadius: '14px',
                                                background: formData.is_anonymous ? 'rgba(253, 161, 54, 0.08)' : 'rgba(255,255,255,0.02)',
                                                border: '1px solid',
                                                borderColor: formData.is_anonymous ? '#FDA136' : 'rgba(255,255,255,0.08)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                textAlign: 'left'
                                            }}
                                        >
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(253, 161, 54, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Shield size={20} color="#FDA136" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'white' }}>Cloak Identity (Anonymous)</p>
                                                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>Sanitize personal identifiers from report</p>
                                            </div>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                border: '2px solid',
                                                borderColor: formData.is_anonymous ? '#FDA136' : 'rgba(255,255,255,0.15)',
                                                background: formData.is_anonymous ? '#FDA136' : 'transparent',
                                                position: 'relative'
                                            }}>
                                                {formData.is_anonymous && <div style={{ position: 'absolute', inset: '3px', background: 'white', borderRadius: '50%' }} />}
                                            </div>
                                        </button>

                                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                                            {PRIORITIES.map(prio => (
                                                <button
                                                    key={prio}
                                                    onClick={() => updateField('priority', prio)}
                                                    style={{
                                                        flex: 1,
                                                        minWidth: '80px',
                                                        padding: '12px',
                                                        borderRadius: '10px',
                                                        border: '1px solid',
                                                        borderColor: formData.priority === prio ? '#FDA136' : 'rgba(255, 255, 255, 0.05)',
                                                        background: formData.priority === prio ? 'rgba(253, 161, 54, 0.1)' : 'rgba(255, 255, 255, 0.01)',
                                                        color: formData.priority === prio ? 'white' : 'rgba(255, 255, 255, 0.3)',
                                                        fontSize: '12px',
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {prio}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                    <Button variant="secondary" onClick={prevStep} style={{ flex: 1, height: '56px' }}>Back</Button>
                                    <Button onClick={handleSubmit} loading={loading} glow style={{
                                        flex: 2,
                                        height: '56px',
                                        background: 'linear-gradient(115deg, #E65A1F, #FDA136)',
                                        boxShadow: '0 8px 24px rgba(230, 90, 31, 0.2)'
                                    }}>
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Execute Transmission'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </GlassyCard>
        </div>
    );
};
