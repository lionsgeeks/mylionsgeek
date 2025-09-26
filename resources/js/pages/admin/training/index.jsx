import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import React from 'react'
import CreatTraining from './partials/CreatTraining'

export default function Training({ trainings, coaches }) {
  return (
    <AppLayout>
      <Head title="Training" />

      <div className="p-6">
        {/* Header with Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Training</h1>

          {/* Dialog for Add Training - CORRECTION ICI */}
          <CreatTraining coaches={coaches}/> {/* Ajout de coaches={coaches} */}
        </div>

      
      </div>
    </AppLayout>
  )
}