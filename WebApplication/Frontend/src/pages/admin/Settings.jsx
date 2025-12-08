import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, Server, Database, Lock } from 'lucide-react';

const Settings = () => {
    return (
        <div className="space-y-8 p-6">
            <div className="border-b border-slate-800 pb-6">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <SettingsIcon className="text-blue-500" size={32} />
                    System Configuration Roadmap
                </h1>
                <p className="text-slate-400 max-w-2xl">
                    This section outlines the planned configuration modules for the S.H.I.E.L.D. platform.
                    These settings are intended to give administrators full control over the SOC environment
                    in future updates.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* General Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-colors">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                        <SettingsIcon className="text-blue-400" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">General Settings</h3>
                    <ul className="space-y-2 text-slate-400 text-sm list-disc pl-4">
                        <li>Platform branding and custom naming</li>
                        <li>Global timezone and localization</li>
                        <li>Default formatting (Date/Time)</li>
                        <li>Support contact information management</li>
                    </ul>
                </div>

                {/* Security Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/30 transition-colors">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="text-emerald-400" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Security Policies</h3>
                    <ul className="space-y-2 text-slate-400 text-sm list-disc pl-4">
                        <li>Mandatory 2FA enforcement for admins</li>
                        <li>Password complexity rules & rotation</li>
                        <li>Session timeout duration settings</li>
                        <li>IP whitelisting for admin access</li>
                    </ul>
                </div>

                {/* Notifications Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-yellow-500/30 transition-colors">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                        <Bell className="text-yellow-400" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Alerts & Notifications</h3>
                    <ul className="space-y-2 text-slate-400 text-sm list-disc pl-4">
                        <li>SMTP Server configuration for emails</li>
                        <li>Slack/Discord Webhook URL management</li>
                        <li>Alert severity threshold configuration</li>
                        <li>SMS gateway integration (Twilio)</li>
                    </ul>
                </div>

                {/* Integrations Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-purple-500/30 transition-colors">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                        <Server className="text-purple-400" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">External Integrations</h3>
                    <ul className="space-y-2 text-slate-400 text-sm list-disc pl-4">
                        <li>VirusTotal API Key management</li>
                        <li>AlienVault OTX feed subscription</li>
                        <li>SIEM forwarding (Splunk/ElasticSearch)</li>
                        <li>JIRA integration for ticketing</li>
                    </ul>
                </div>

                {/* Data Retention Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-red-500/30 transition-colors">
                    <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                        <Database className="text-red-400" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Data Governance</h3>
                    <ul className="space-y-2 text-slate-400 text-sm list-disc pl-4">
                        <li>Log retention period settings</li>
                        <li>Automatic archival to cold storage</li>
                        <li>Database purge scheduling</li>
                        <li>Audit log export compliance</li>
                    </ul>
                </div>

                {/* Access Control Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                        <Lock className="text-cyan-400" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">RBAC & Access</h3>
                    <ul className="space-y-2 text-slate-400 text-sm list-disc pl-4">
                        <li>Custom role definitions</li>
                        <li>Permission granularity tuning</li>
                        <li>API Access Token management</li>
                        <li>User invitation & approval flows</li>
                    </ul>
                </div>
            </div>

            <div className="mt-8 p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg text-center">
                <p className="text-blue-400 text-sm">
                    <strong>Note for Developers:</strong> This page serves as a blueprint for the <code>/api/v1/settings</code> endpoint implementation.
                    Frontend controls will be bound to the global configuration schema once the backend services are ready.
                </p>
            </div>
        </div>
    );
};

export default Settings;
