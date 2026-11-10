import React, { useState } from 'react'
import { Sidebar, NavTab } from './Sidebar'
import { DashboardOverview } from './DashboardOverview'
import { PatientList } from './PatientList'
import { PatientForm } from './PatientForm'
import { PatientProfile } from './PatientProfile'

export interface OverduePatient {
  id: string
  nome: string
  email?: string
  telefone?: string
  lastConsultationDate: string
  daysSinceLastConsultation: number
}

interface DashboardProps {
  onNavigateToPatients?: () => void
  onSelectPatient?: (patientId: string) => void
}

export const Dashboard: React.FC<DashboardProps> = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId)
    setCurrentTab('patient-profile')
  }

  const handleNewPatientSuccess = (newPatientId: string) => {
    if (newPatientId) {
      setSelectedPatientId(newPatientId)
      setCurrentTab('patient-profile')
    } else {
      setCurrentTab('patients')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Menu Lateral Fixo em todas as telas */}
      <Sidebar 
        currentTab={currentTab} 
        onNavigate={(tab) => {
          if (tab === 'patients') {
            setSelectedPatientId(null)
          }
          setCurrentTab(tab)
        }} 
      />

      {/* Conteúdo Dinâmico */}
      {currentTab === 'dashboard' && (
        <DashboardOverview
          onNavigateToPatients={() => setCurrentTab('patients')}
          onSelectPatient={handleSelectPatient}
        />
      )}

      {currentTab === 'patients' && (
        <PatientList
          onNewPatient={() => setCurrentTab('new-patient')}
          onSelectPatient={handleSelectPatient}
        />
      )}

      {currentTab === 'new-patient' && (
        <PatientForm
          onSuccess={handleNewPatientSuccess}
          onCancel={() => setCurrentTab('patients')}
        />
      )}

      {currentTab === 'patient-profile' && selectedPatientId && (
        <PatientProfile
          patientId={selectedPatientId}
          onBack={() => setCurrentTab('patients')}
        />
      )}
    </div>
  )
}
