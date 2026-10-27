import React from 'react';
import { HelpCircle, Clock, ShieldCheck, MapPin, Radio, CheckCircle2, Building, ChevronRight } from 'lucide-react';

export default function HelpCenter() {
  const faqs = [
    {
      q: 'How does the CivicEye 5-Stage Complaint Lifecycle work?',
      a: 'A civic grievance moves through: 1) SUBMITTED (Citizen registers issue with geotagged evidence), 2) ASSIGNED (Department Head reviews and assigns a specialized field verifier), 3) IN PROGRESS (Verifier conducts on-site work/repairs), 4) RESOLVED (Municipal action complete), and 5) CLOSED (Citizen confirms resolution with star rating).',
    },
    {
      q: 'How does Intelligent Duplicate Detection work?',
      a: 'CivicEye combines geospatial proximity with semantic text embeddings. A 10-meter radius buffer is scanned around your coordinates, and incoming titles/descriptions are compared via cosine similarity. If an identical problem was already logged, the system warns you to prevent duplicate work orders.',
    },
    {
      q: 'What are the municipal Service Level Agreement (SLA) deadlines?',
      a: 'Deadlines depend on calculated priority: CRITICAL issues have a 24-hour SLA; HIGH priority issues have a 48-hour SLA; MEDIUM priority issues have a 72-hour SLA; and LOW issues have a 120-hour SLA. If an issue passes its deadline without resolution, it transitions to SLA BREACHED.',
    },
    {
      q: 'What types of media evidence can I upload?',
      a: 'The system accepts photos in JPG, PNG, and WEBP formats with a maximum file size of 5 MB, as specified in Municipal System Requirements.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5 sm:space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <span className="text-[11px] font-bold tracking-wider uppercase text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-md">
          Knowledge Base & Support
        </span>
        <h1 className="text-xl font-bold text-slate-900 mt-2 tracking-tight">
          CivicEye Help Center & Operating Guidelines
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Everything you need to know about crowdsourced civic issue reporting, departmental routing, and resolution tracking.
        </p>
      </div>

      {/* 5 Municipal Departments Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase">
          Municipal Department Classification Taxonomy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="font-bold text-brand-700">1. Roads & Infrastructure</span>
            <p className="text-slate-500 text-[11px]">Potholes, damaged tarmac, broken footpath slabs, missing manhole covers, bridge defects.</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="font-bold text-brand-700">2. Streetlights & Electricity</span>
            <p className="text-slate-500 text-[11px]">Dark streetlights, sparking poles, dangling high-voltage cables, damaged transformers.</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="font-bold text-brand-700">3. Waste Management & Sanitation</span>
            <p className="text-slate-500 text-[11px]">Overflowing community bins, open garbage dumping, blocked drainage channels, animal carcass.</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="font-bold text-brand-700">4. Water Supply</span>
            <p className="text-slate-500 text-[11px]">Main pipe bursts, contaminated muddy water, low municipal pressure, unclosed valves.</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="font-bold text-brand-700">5. Public Safety & Other Hazards</span>
            <p className="text-slate-500 text-[11px]">Fallen trees, dangerous open trenches, stray pack menace, structural wall collapse risk.</p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5">
              <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-2">
                <HelpCircle className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>{f.q}</span>
              </h4>
              <p className="text-xs text-slate-600 pl-5 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
