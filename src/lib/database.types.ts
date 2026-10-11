export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          county: string | null
          id: string
          line1: string | null
          line2: string | null
          plot_or_site_name: string | null
          postcode: string | null
          town: string | null
        }
        Insert: {
          county?: string | null
          id?: string
          line1?: string | null
          line2?: string | null
          plot_or_site_name?: string | null
          postcode?: string | null
          town?: string | null
        }
        Update: {
          county?: string | null
          id?: string
          line1?: string | null
          line2?: string | null
          plot_or_site_name?: string | null
          postcode?: string | null
          town?: string | null
        }
        Relationships: []
      }
      assessment_positions: {
        Row: {
          assessed_on: string
          barrier_type_code: string | null
          distance_m: number | null
          habitable_confirmed: boolean
          id: string
          job_id: string
          line_of_sight: Database["public"]["Enums"]["line_of_sight"] | null
          notes: string | null
          photo_url: string | null
          property_description: string | null
          reflective_surfaces: number | null
          source: string
        }
        Insert: {
          assessed_on?: string
          barrier_type_code?: string | null
          distance_m?: number | null
          habitable_confirmed?: boolean
          id?: string
          job_id: string
          line_of_sight?: Database["public"]["Enums"]["line_of_sight"] | null
          notes?: string | null
          photo_url?: string | null
          property_description?: string | null
          reflective_surfaces?: number | null
          source?: string
        }
        Update: {
          assessed_on?: string
          barrier_type_code?: string | null
          distance_m?: number | null
          habitable_confirmed?: boolean
          id?: string
          job_id?: string
          line_of_sight?: Database["public"]["Enums"]["line_of_sight"] | null
          notes?: string | null
          photo_url?: string | null
          property_description?: string | null
          reflective_surfaces?: number | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_positions_barrier_type_code_fkey"
            columns: ["barrier_type_code"]
            isOneToOne: false
            referencedRelation: "barrier_types"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_holidays: {
        Row: {
          day: string
          name: string
        }
        Insert: {
          day: string
          name: string
        }
        Update: {
          day?: string
          name?: string
        }
        Relationships: []
      }
      barrier_attenuation: {
        Row: {
          attenuation_db: number
          barrier_class: Database["public"]["Enums"]["barrier_class"]
          line_of_sight: Database["public"]["Enums"]["line_of_sight"]
        }
        Insert: {
          attenuation_db: number
          barrier_class: Database["public"]["Enums"]["barrier_class"]
          line_of_sight: Database["public"]["Enums"]["line_of_sight"]
        }
        Update: {
          attenuation_db?: number
          barrier_class?: Database["public"]["Enums"]["barrier_class"]
          line_of_sight?: Database["public"]["Enums"]["line_of_sight"]
        }
        Relationships: []
      }
      barrier_types: {
        Row: {
          barrier_class: Database["public"]["Enums"]["barrier_class"]
          code: string
          label: string
          note: string | null
        }
        Insert: {
          barrier_class: Database["public"]["Enums"]["barrier_class"]
          code: string
          label: string
          note?: string | null
        }
        Update: {
          barrier_class?: Database["public"]["Enums"]["barrier_class"]
          code?: string
          label?: string
          note?: string | null
        }
        Relationships: []
      }
      bus_applications: {
        Row: {
          applied_on: string | null
          assisted_digital: boolean
          consent_given_on: string | null
          consent_requested_on: string | null
          id: string
          info_requested_on: string | null
          info_responded_on: string | null
          job_id: string
          redeemed_amount: number | null
          redeemed_on: string | null
          reference: string | null
          rejected_on: string | null
          submitted_grant: number | null
          submitted_heat_pump_cost: number | null
          submitted_quote_date: string | null
          submitted_quote_ref: string | null
          submitted_total_before_grant: number | null
          voucher_expires_on: string | null
          voucher_id: string | null
          voucher_issued_on: string | null
          withdrawn_on: string | null
        }
        Insert: {
          applied_on?: string | null
          assisted_digital?: boolean
          consent_given_on?: string | null
          consent_requested_on?: string | null
          id?: string
          info_requested_on?: string | null
          info_responded_on?: string | null
          job_id: string
          redeemed_amount?: number | null
          redeemed_on?: string | null
          reference?: string | null
          rejected_on?: string | null
          submitted_grant?: number | null
          submitted_heat_pump_cost?: number | null
          submitted_quote_date?: string | null
          submitted_quote_ref?: string | null
          submitted_total_before_grant?: number | null
          voucher_expires_on?: string | null
          voucher_id?: string | null
          voucher_issued_on?: string | null
          withdrawn_on?: string | null
        }
        Update: {
          applied_on?: string | null
          assisted_digital?: boolean
          consent_given_on?: string | null
          consent_requested_on?: string | null
          id?: string
          info_requested_on?: string | null
          info_responded_on?: string | null
          job_id?: string
          redeemed_amount?: number | null
          redeemed_on?: string | null
          reference?: string | null
          rejected_on?: string | null
          submitted_grant?: number | null
          submitted_heat_pump_cost?: number | null
          submitted_quote_date?: string | null
          submitted_quote_ref?: string | null
          submitted_total_before_grant?: number | null
          voucher_expires_on?: string | null
          voucher_id?: string | null
          voucher_issued_on?: string | null
          withdrawn_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      chase_rules: {
        Row: {
          active: boolean
          chase_party: Database["public"]["Enums"]["party_role"] | null
          clock_event: string
          code: string
          escalate_after_days: number | null
          escalate_to: string | null
          label: string
          note: string | null
          only_when: string | null
          plan_ref: number | null
          repeat_every_days: number | null
          sends_email: boolean
          stage: Database["public"]["Enums"]["job_stage"] | null
          start_offset_days: number | null
        }
        Insert: {
          active?: boolean
          chase_party?: Database["public"]["Enums"]["party_role"] | null
          clock_event: string
          code: string
          escalate_after_days?: number | null
          escalate_to?: string | null
          label: string
          note?: string | null
          only_when?: string | null
          plan_ref?: number | null
          repeat_every_days?: number | null
          sends_email?: boolean
          stage?: Database["public"]["Enums"]["job_stage"] | null
          start_offset_days?: number | null
        }
        Update: {
          active?: boolean
          chase_party?: Database["public"]["Enums"]["party_role"] | null
          clock_event?: string
          code?: string
          escalate_after_days?: number | null
          escalate_to?: string | null
          label?: string
          note?: string | null
          only_when?: string | null
          plan_ref?: number | null
          repeat_every_days?: number | null
          sends_email?: boolean
          stage?: Database["public"]["Enums"]["job_stage"] | null
          start_offset_days?: number | null
        }
        Relationships: []
      }
      checkpoint_types: {
        Row: {
          audit_item: boolean
          code: string
          install_stage: string | null
          label: string
          required_for: Database["public"]["Enums"]["supervision_colour"][]
          sort_order: number
          what_to_photograph: string | null
        }
        Insert: {
          audit_item?: boolean
          code: string
          install_stage?: string | null
          label: string
          required_for?: Database["public"]["Enums"]["supervision_colour"][]
          sort_order?: number
          what_to_photograph?: string | null
        }
        Update: {
          audit_item?: boolean
          code?: string
          install_stage?: string | null
          label?: string
          required_for?: Database["public"]["Enums"]["supervision_colour"][]
          sort_order?: number
          what_to_photograph?: string | null
        }
        Relationships: []
      }
      complaints: {
        Row: {
          acknowledged_on: string | null
          action_taken: string | null
          complainant_contact: string | null
          complainant_name: string
          complaint: string
          handler_id: string | null
          id: string
          installer_id: string | null
          job_id: string | null
          new_response_date: string | null
          no_heat_or_hot_water: boolean
          outcome: string | null
          preventive_action: string | null
          received_at: string
          resolved_on: string | null
          response_sent_on: string | null
          root_cause: string | null
          subcontractor_involved: boolean | null
          visited_on: string | null
        }
        Insert: {
          acknowledged_on?: string | null
          action_taken?: string | null
          complainant_contact?: string | null
          complainant_name: string
          complaint: string
          handler_id?: string | null
          id?: string
          installer_id?: string | null
          job_id?: string | null
          new_response_date?: string | null
          no_heat_or_hot_water?: boolean
          outcome?: string | null
          preventive_action?: string | null
          received_at?: string
          resolved_on?: string | null
          response_sent_on?: string | null
          root_cause?: string | null
          subcontractor_involved?: boolean | null
          visited_on?: string | null
        }
        Update: {
          acknowledged_on?: string | null
          action_taken?: string | null
          complainant_contact?: string | null
          complainant_name?: string
          complaint?: string
          handler_id?: string | null
          id?: string
          installer_id?: string | null
          job_id?: string | null
          new_response_date?: string | null
          no_heat_or_hot_water?: boolean
          outcome?: string | null
          preventive_action?: string | null
          received_at?: string
          resolved_on?: string | null
          response_sent_on?: string | null
          root_cause?: string | null
          subcontractor_involved?: boolean | null
          visited_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_handler_id_fkey"
            columns: ["handler_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installer_onboarding"
            referencedColumns: ["installer_id"]
          },
          {
            foreignKeyName: "complaints_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      credential_types: {
        Row: {
          affects_level: boolean
          code: string
          has_expiry: boolean
          label: string
          note: string | null
        }
        Insert: {
          affects_level?: boolean
          code: string
          has_expiry?: boolean
          label: string
          note?: string | null
        }
        Update: {
          affects_level?: boolean
          code?: string
          has_expiry?: boolean
          label?: string
          note?: string | null
        }
        Relationships: []
      }
      dno_applications: {
        Row: {
          application_type: string | null
          approval_needed_before_install: boolean
          approved_on: string | null
          id: string
          job_id: string
          notes: string | null
          passed_to_dno_on: string | null
          reference: string | null
          submitted_on: string | null
          withdrawn_on: string | null
        }
        Insert: {
          application_type?: string | null
          approval_needed_before_install?: boolean
          approved_on?: string | null
          id?: string
          job_id: string
          notes?: string | null
          passed_to_dno_on?: string | null
          reference?: string | null
          submitted_on?: string | null
          withdrawn_on?: string | null
        }
        Update: {
          application_type?: string | null
          approval_needed_before_install?: boolean
          approved_on?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          passed_to_dno_on?: string | null
          reference?: string | null
          submitted_on?: string | null
          withdrawn_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      event_log: {
        Row: {
          action: string
          actor_kind: Database["public"]["Enums"]["actor_kind"]
          actor_label: string | null
          at: string
          changes: Json | null
          entity: string
          entity_id: string | null
          id: number
          job_id: string | null
        }
        Insert: {
          action: string
          actor_kind?: Database["public"]["Enums"]["actor_kind"]
          actor_label?: string | null
          at?: string
          changes?: Json | null
          entity: string
          entity_id?: string | null
          id?: number
          job_id?: string | null
        }
        Update: {
          action?: string
          actor_kind?: Database["public"]["Enums"]["actor_kind"]
          actor_label?: string | null
          at?: string
          changes?: Json | null
          entity?: string
          entity_id?: string | null
          id?: number
          job_id?: string | null
        }
        Relationships: []
      }
      heat_pump_models: {
        Row: {
          active: boolean
          id: string
          manufacturer_id: string
          model: string
          output_kw: number | null
          sound_power_db: number
          sound_power_note: string | null
        }
        Insert: {
          active?: boolean
          id?: string
          manufacturer_id: string
          model: string
          output_kw?: number | null
          sound_power_db: number
          sound_power_note?: string | null
        }
        Update: {
          active?: boolean
          id?: string
          manufacturer_id?: string
          model?: string
          output_kw?: number | null
          sound_power_db?: number
          sound_power_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "heat_pump_models_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      hies_registrations: {
        Row: {
          completion_entered_on: string | null
          deposit_amount: number | null
          deposit_paid_on: string | null
          guarantee_sent_on: string | null
          job_id: string
          reference: string | null
          registered_on: string | null
        }
        Insert: {
          completion_entered_on?: string | null
          deposit_amount?: number | null
          deposit_paid_on?: string | null
          guarantee_sent_on?: string | null
          job_id: string
          reference?: string | null
          registered_on?: string | null
        }
        Update: {
          completion_entered_on?: string | null
          deposit_amount?: number | null
          deposit_paid_on?: string | null
          guarantee_sent_on?: string | null
          job_id?: string
          reference?: string | null
          registered_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hies_registrations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "hies_registrations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "hies_registrations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hies_registrations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "hies_registrations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "hies_registrations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "hies_registrations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "hies_registrations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "hies_registrations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      installer_payouts: {
        Row: {
          amount: number
          id: string
          installer_id: string
          job_id: string
          job_payment_id: string | null
          paid_on: string | null
          reference: string | null
        }
        Insert: {
          amount: number
          id?: string
          installer_id: string
          job_id: string
          job_payment_id?: string | null
          paid_on?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          id?: string
          installer_id?: string
          job_id?: string
          job_payment_id?: string | null
          paid_on?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installer_payouts_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installer_onboarding"
            referencedColumns: ["installer_id"]
          },
          {
            foreignKeyName: "installer_payouts_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installer_payouts_job_payment_id_fkey"
            columns: ["job_payment_id"]
            isOneToOne: false
            referencedRelation: "job_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      installer_prices: {
        Row: {
          checked_by: string | null
          file_url: string | null
          heat_pump_cost: number | null
          id: string
          job_id: string
          method: string
          received_on: string
          spec_version_id: string | null
          total: number | null
        }
        Insert: {
          checked_by?: string | null
          file_url?: string | null
          heat_pump_cost?: number | null
          id?: string
          job_id: string
          method: string
          received_on?: string
          spec_version_id?: string | null
          total?: number | null
        }
        Update: {
          checked_by?: string | null
          file_url?: string | null
          heat_pump_cost?: number | null
          id?: string
          job_id?: string
          method?: string
          received_on?: string
          spec_version_id?: string | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "installer_prices_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installer_prices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_prices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_prices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installer_prices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_prices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_prices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_prices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_prices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_prices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installer_prices_spec_version_id_fkey"
            columns: ["spec_version_id"]
            isOneToOne: false
            referencedRelation: "job_current_spec"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installer_prices_spec_version_id_fkey"
            columns: ["spec_version_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["spec_version_id"]
          },
          {
            foreignKeyName: "installer_prices_spec_version_id_fkey"
            columns: ["spec_version_id"]
            isOneToOne: false
            referencedRelation: "spec_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      installers: {
        Row: {
          active: boolean
          address_id: string | null
          calibration_expires_on: string | null
          company_number: string | null
          contact_name: string | null
          default_manufacturer_id: string | null
          easymcs_subcontractor_on: string | null
          email: string | null
          employers_liability_expires_on: string | null
          f05_signed_on: string | null
          f05a_signed_on: string | null
          id: string
          name: string
          notes: string | null
          onboarding_started_on: string | null
          phone: string | null
          public_liability_expires_on: string | null
          r09_approved_on: string | null
          supplies_technical_supervisor: boolean
        }
        Insert: {
          active?: boolean
          address_id?: string | null
          calibration_expires_on?: string | null
          company_number?: string | null
          contact_name?: string | null
          default_manufacturer_id?: string | null
          easymcs_subcontractor_on?: string | null
          email?: string | null
          employers_liability_expires_on?: string | null
          f05_signed_on?: string | null
          f05a_signed_on?: string | null
          id?: string
          name: string
          notes?: string | null
          onboarding_started_on?: string | null
          phone?: string | null
          public_liability_expires_on?: string | null
          r09_approved_on?: string | null
          supplies_technical_supervisor?: boolean
        }
        Update: {
          active?: boolean
          address_id?: string | null
          calibration_expires_on?: string | null
          company_number?: string | null
          contact_name?: string | null
          default_manufacturer_id?: string | null
          easymcs_subcontractor_on?: string | null
          email?: string | null
          employers_liability_expires_on?: string | null
          f05_signed_on?: string | null
          f05a_signed_on?: string | null
          id?: string
          name?: string
          notes?: string | null
          onboarding_started_on?: string | null
          phone?: string | null
          public_liability_expires_on?: string | null
          r09_approved_on?: string | null
          supplies_technical_supervisor?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "installers_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installers_default_manufacturer_id_fkey"
            columns: ["default_manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_checkpoint_photos: {
        Row: {
          checkpoint_code: string
          id: string
          job_id: string
          latitude: number | null
          longitude: number | null
          photo_url: string
          review_note: string | null
          review_status: string
          reviewed_by: string | null
          taken_at: string | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          checkpoint_code: string
          id?: string
          job_id: string
          latitude?: number | null
          longitude?: number | null
          photo_url: string
          review_note?: string | null
          review_status?: string
          reviewed_by?: string | null
          taken_at?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          checkpoint_code?: string
          id?: string
          job_id?: string
          latitude?: number | null
          longitude?: number | null
          photo_url?: string
          review_note?: string | null
          review_status?: string
          reviewed_by?: string | null
          taken_at?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_checkpoint_photos_checkpoint_code_fkey"
            columns: ["checkpoint_code"]
            isOneToOne: false
            referencedRelation: "checkpoint_types"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "job_checkpoint_photos_checkpoint_code_fkey"
            columns: ["checkpoint_code"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "job_checkpoint_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_checkpoint_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_checkpoint_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_checkpoint_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_checkpoint_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_checkpoint_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_checkpoint_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_checkpoint_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_checkpoint_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_checkpoint_photos_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      job_milestones: {
        Row: {
          done_on: string
          file_url: string | null
          id: string
          job_id: string
          milestone_code: string
          note: string | null
          recorded_at: string
          reference: string | null
        }
        Insert: {
          done_on?: string
          file_url?: string | null
          id?: string
          job_id: string
          milestone_code: string
          note?: string | null
          recorded_at?: string
          reference?: string | null
        }
        Update: {
          done_on?: string
          file_url?: string | null
          id?: string
          job_id?: string
          milestone_code?: string
          note?: string | null
          recorded_at?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_milestones_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_milestones_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_milestones_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_milestones_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_milestones_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_milestones_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_milestones_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_milestones_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_milestones_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_milestones_milestone_code_fkey"
            columns: ["milestone_code"]
            isOneToOne: false
            referencedRelation: "milestone_types"
            referencedColumns: ["code"]
          },
        ]
      }
      job_operatives: {
        Row: {
          is_lead: boolean
          job_id: string
          operative_id: string
        }
        Insert: {
          is_lead?: boolean
          job_id: string
          operative_id: string
        }
        Update: {
          is_lead?: boolean
          job_id?: string
          operative_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_operatives_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_operatives_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_operatives_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_operatives_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_operatives_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_operatives_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_operatives_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_operatives_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_operatives_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_operatives_operative_id_fkey"
            columns: ["operative_id"]
            isOneToOne: false
            referencedRelation: "credential_expiry"
            referencedColumns: ["operative_id"]
          },
          {
            foreignKeyName: "job_operatives_operative_id_fkey"
            columns: ["operative_id"]
            isOneToOne: false
            referencedRelation: "operatives"
            referencedColumns: ["id"]
          },
        ]
      }
      job_payments: {
        Row: {
          amount_due: number
          due_on: string | null
          id: string
          in_contract: boolean
          job_id: string
          kind: string
          label: string | null
          note: string | null
          paid_amount: number | null
          paid_on: string | null
        }
        Insert: {
          amount_due: number
          due_on?: string | null
          id?: string
          in_contract?: boolean
          job_id: string
          kind: string
          label?: string | null
          note?: string | null
          paid_amount?: number | null
          paid_on?: string | null
        }
        Update: {
          amount_due?: number
          due_on?: string | null
          id?: string
          in_contract?: boolean
          job_id?: string
          kind?: string
          label?: string | null
          note?: string | null
          paid_amount?: number | null
          paid_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_requirements: {
        Row: {
          file_url: string | null
          id: string
          job_id: string
          note: string | null
          received_at: string | null
          received_via: string | null
          requested_at: string | null
          requirement_id: string
          status: Database["public"]["Enums"]["req_status"]
          waived_reason: string | null
        }
        Insert: {
          file_url?: string | null
          id?: string
          job_id: string
          note?: string | null
          received_at?: string | null
          received_via?: string | null
          requested_at?: string | null
          requirement_id: string
          status?: Database["public"]["Enums"]["req_status"]
          waived_reason?: string | null
        }
        Update: {
          file_url?: string | null
          id?: string
          job_id?: string
          note?: string | null
          received_at?: string | null
          received_via?: string | null
          requested_at?: string | null
          requirement_id?: string
          status?: Database["public"]["Enums"]["req_status"]
          waived_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requirements_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          assignee_id: string | null
          bus_grant_amount: number | null
          cancelled_at: string | null
          cancelled_reason: string | null
          contract_value: number | null
          created_at: string
          crm_ref: string | null
          drive_folder_url: string | null
          easymcs_project_ref: string | null
          enquiry_contact_email: string | null
          enquiry_contact_name: string | null
          enquiry_contact_phone: string | null
          enquiry_contact_role: Database["public"]["Enums"]["party_role"] | null
          enquiry_notes: string | null
          epc_expires_on: string | null
          estimated_heat_loss_kw: number | null
          estimated_unit_id: string | null
          existing_heating_type: string | null
          express_consent_signed_on: string | null
          final_heat_loss_kw: number | null
          final_unit_id: string | null
          has_cylinder: boolean
          heat_pump_cost: number | null
          homeowner_email: string | null
          homeowner_name: string | null
          homeowner_phone: string | null
          id: string
          id_check_failed: boolean
          install_address_id: string | null
          installer_id: string | null
          job_ref: string
          job_type: Database["public"]["Enums"]["job_type"] | null
          main_contractor_email: string | null
          main_contractor_name: string | null
          manufacturer_id: string | null
          on_hold_reason: string | null
          on_hold_review_on: string | null
          owner_residential_address_id: string | null
          planned_install_finish: string | null
          planned_install_start: string | null
          preferred_cylinder_make: string | null
          quote_date: string | null
          quote_ref: string | null
          quote_total_before_grant: number | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          risk_reasoning: string | null
          stage: Database["public"]["Enums"]["job_stage"]
          supervision_approach: string | null
          technical_supervisor_id: string | null
          technology: Database["public"]["Enums"]["technology"]
          updated_at: string
          uses_bus_grant: boolean
        }
        Insert: {
          assignee_id?: string | null
          bus_grant_amount?: number | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          contract_value?: number | null
          created_at?: string
          crm_ref?: string | null
          drive_folder_url?: string | null
          easymcs_project_ref?: string | null
          enquiry_contact_email?: string | null
          enquiry_contact_name?: string | null
          enquiry_contact_phone?: string | null
          enquiry_contact_role?:
            | Database["public"]["Enums"]["party_role"]
            | null
          enquiry_notes?: string | null
          epc_expires_on?: string | null
          estimated_heat_loss_kw?: number | null
          estimated_unit_id?: string | null
          existing_heating_type?: string | null
          express_consent_signed_on?: string | null
          final_heat_loss_kw?: number | null
          final_unit_id?: string | null
          has_cylinder?: boolean
          heat_pump_cost?: number | null
          homeowner_email?: string | null
          homeowner_name?: string | null
          homeowner_phone?: string | null
          id?: string
          id_check_failed?: boolean
          install_address_id?: string | null
          installer_id?: string | null
          job_ref: string
          job_type?: Database["public"]["Enums"]["job_type"] | null
          main_contractor_email?: string | null
          main_contractor_name?: string | null
          manufacturer_id?: string | null
          on_hold_reason?: string | null
          on_hold_review_on?: string | null
          owner_residential_address_id?: string | null
          planned_install_finish?: string | null
          planned_install_start?: string | null
          preferred_cylinder_make?: string | null
          quote_date?: string | null
          quote_ref?: string | null
          quote_total_before_grant?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_reasoning?: string | null
          stage?: Database["public"]["Enums"]["job_stage"]
          supervision_approach?: string | null
          technical_supervisor_id?: string | null
          technology?: Database["public"]["Enums"]["technology"]
          updated_at?: string
          uses_bus_grant?: boolean
        }
        Update: {
          assignee_id?: string | null
          bus_grant_amount?: number | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          contract_value?: number | null
          created_at?: string
          crm_ref?: string | null
          drive_folder_url?: string | null
          easymcs_project_ref?: string | null
          enquiry_contact_email?: string | null
          enquiry_contact_name?: string | null
          enquiry_contact_phone?: string | null
          enquiry_contact_role?:
            | Database["public"]["Enums"]["party_role"]
            | null
          enquiry_notes?: string | null
          epc_expires_on?: string | null
          estimated_heat_loss_kw?: number | null
          estimated_unit_id?: string | null
          existing_heating_type?: string | null
          express_consent_signed_on?: string | null
          final_heat_loss_kw?: number | null
          final_unit_id?: string | null
          has_cylinder?: boolean
          heat_pump_cost?: number | null
          homeowner_email?: string | null
          homeowner_name?: string | null
          homeowner_phone?: string | null
          id?: string
          id_check_failed?: boolean
          install_address_id?: string | null
          installer_id?: string | null
          job_ref?: string
          job_type?: Database["public"]["Enums"]["job_type"] | null
          main_contractor_email?: string | null
          main_contractor_name?: string | null
          manufacturer_id?: string | null
          on_hold_reason?: string | null
          on_hold_review_on?: string | null
          owner_residential_address_id?: string | null
          planned_install_finish?: string | null
          planned_install_start?: string | null
          preferred_cylinder_make?: string | null
          quote_date?: string | null
          quote_ref?: string | null
          quote_total_before_grant?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_reasoning?: string | null
          stage?: Database["public"]["Enums"]["job_stage"]
          supervision_approach?: string | null
          technical_supervisor_id?: string | null
          technology?: Database["public"]["Enums"]["technology"]
          updated_at?: string
          uses_bus_grant?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_estimated_unit_id_fkey"
            columns: ["estimated_unit_id"]
            isOneToOne: false
            referencedRelation: "heat_pump_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_final_unit_id_fkey"
            columns: ["final_unit_id"]
            isOneToOne: false
            referencedRelation: "heat_pump_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_install_address_id_fkey"
            columns: ["install_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installer_onboarding"
            referencedColumns: ["installer_id"]
          },
          {
            foreignKeyName: "jobs_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_owner_residential_address_id_fkey"
            columns: ["owner_residential_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_technical_supervisor_id_fkey"
            columns: ["technical_supervisor_id"]
            isOneToOne: false
            referencedRelation: "credential_expiry"
            referencedColumns: ["operative_id"]
          },
          {
            foreignKeyName: "jobs_technical_supervisor_id_fkey"
            columns: ["technical_supervisor_id"]
            isOneToOne: false
            referencedRelation: "operatives"
            referencedColumns: ["id"]
          },
        ]
      }
      level_rules: {
        Row: {
          credential_type_code: string
          level: Database["public"]["Enums"]["operative_level"]
          rule_group: string
          technology: Database["public"]["Enums"]["technology"]
        }
        Insert: {
          credential_type_code: string
          level: Database["public"]["Enums"]["operative_level"]
          rule_group: string
          technology: Database["public"]["Enums"]["technology"]
        }
        Update: {
          credential_type_code?: string
          level?: Database["public"]["Enums"]["operative_level"]
          rule_group?: string
          technology?: Database["public"]["Enums"]["technology"]
        }
        Relationships: [
          {
            foreignKeyName: "level_rules_credential_type_code_fkey"
            columns: ["credential_type_code"]
            isOneToOne: false
            referencedRelation: "credential_types"
            referencedColumns: ["code"]
          },
        ]
      }
      manufacturers: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      milestone_types: {
        Row: {
          code: string
          label: string
          note: string | null
          sort_order: number
          stage: Database["public"]["Enums"]["job_stage"]
        }
        Insert: {
          code: string
          label: string
          note?: string | null
          sort_order?: number
          stage: Database["public"]["Enums"]["job_stage"]
        }
        Update: {
          code?: string
          label?: string
          note?: string | null
          sort_order?: number
          stage?: Database["public"]["Enums"]["job_stage"]
        }
        Relationships: []
      }
      nonconformities: {
        Row: {
          action_plan: string | null
          clause: string | null
          closed_on: string | null
          could_be_systemic: boolean | null
          description: string
          id: string
          job_id: string | null
          plan_sent_on: string | null
          raised_on: string
          root_cause: string | null
          source: string
        }
        Insert: {
          action_plan?: string | null
          clause?: string | null
          closed_on?: string | null
          could_be_systemic?: boolean | null
          description: string
          id?: string
          job_id?: string | null
          plan_sent_on?: string | null
          raised_on?: string
          root_cause?: string | null
          source: string
        }
        Update: {
          action_plan?: string | null
          clause?: string | null
          closed_on?: string | null
          could_be_systemic?: boolean | null
          description?: string
          id?: string
          job_id?: string | null
          plan_sent_on?: string | null
          raised_on?: string
          root_cause?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "nonconformities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "nonconformities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "nonconformities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nonconformities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "nonconformities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "nonconformities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "nonconformities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "nonconformities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "nonconformities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_types: {
        Row: {
          category: string
          code: string
          description: string
          u_value: number
        }
        Insert: {
          category: string
          code: string
          description: string
          u_value: number
        }
        Update: {
          category?: string
          code?: string
          description?: string
          u_value?: number
        }
        Relationships: []
      }
      operative_credentials: {
        Row: {
          credential_type_code: string
          expires_on: string | null
          file_url: string | null
          id: string
          issued_on: string | null
          operative_id: string
          reference: string | null
          technology: Database["public"]["Enums"]["technology"] | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          credential_type_code: string
          expires_on?: string | null
          file_url?: string | null
          id?: string
          issued_on?: string | null
          operative_id: string
          reference?: string | null
          technology?: Database["public"]["Enums"]["technology"] | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          credential_type_code?: string
          expires_on?: string | null
          file_url?: string | null
          id?: string
          issued_on?: string | null
          operative_id?: string
          reference?: string | null
          technology?: Database["public"]["Enums"]["technology"] | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operative_credentials_credential_type_code_fkey"
            columns: ["credential_type_code"]
            isOneToOne: false
            referencedRelation: "credential_types"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "operative_credentials_operative_id_fkey"
            columns: ["operative_id"]
            isOneToOne: false
            referencedRelation: "credential_expiry"
            referencedColumns: ["operative_id"]
          },
          {
            foreignKeyName: "operative_credentials_operative_id_fkey"
            columns: ["operative_id"]
            isOneToOne: false
            referencedRelation: "operatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operative_credentials_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      operative_levels: {
        Row: {
          level: Database["public"]["Enums"]["operative_level"]
          note: string | null
          operative_id: string
          set_on: string
          technology: Database["public"]["Enums"]["technology"]
        }
        Insert: {
          level: Database["public"]["Enums"]["operative_level"]
          note?: string | null
          operative_id: string
          set_on?: string
          technology: Database["public"]["Enums"]["technology"]
        }
        Update: {
          level?: Database["public"]["Enums"]["operative_level"]
          note?: string | null
          operative_id?: string
          set_on?: string
          technology?: Database["public"]["Enums"]["technology"]
        }
        Relationships: [
          {
            foreignKeyName: "operative_levels_operative_id_fkey"
            columns: ["operative_id"]
            isOneToOne: false
            referencedRelation: "credential_expiry"
            referencedColumns: ["operative_id"]
          },
          {
            foreignKeyName: "operative_levels_operative_id_fkey"
            columns: ["operative_id"]
            isOneToOne: false
            referencedRelation: "operatives"
            referencedColumns: ["id"]
          },
        ]
      }
      operatives: {
        Row: {
          active: boolean
          contract_with_mss_on: string | null
          easymcs_setup_on: string | null
          email: string | null
          id: string
          installer_id: string | null
          is_technical_supervisor: boolean
          name: string
          phone: string | null
          r07_received_on: string | null
          staff_id: string | null
          ts_assessed_on: string | null
        }
        Insert: {
          active?: boolean
          contract_with_mss_on?: string | null
          easymcs_setup_on?: string | null
          email?: string | null
          id?: string
          installer_id?: string | null
          is_technical_supervisor?: boolean
          name: string
          phone?: string | null
          r07_received_on?: string | null
          staff_id?: string | null
          ts_assessed_on?: string | null
        }
        Update: {
          active?: boolean
          contract_with_mss_on?: string | null
          easymcs_setup_on?: string | null
          email?: string | null
          id?: string
          installer_id?: string | null
          is_technical_supervisor?: boolean
          name?: string
          phone?: string | null
          r07_received_on?: string | null
          staff_id?: string | null
          ts_assessed_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operatives_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installer_onboarding"
            referencedColumns: ["installer_id"]
          },
          {
            foreignKeyName: "operatives_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operatives_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      postcode_climate: {
        Row: {
          degree_days: number
          low_temp_c: number
          prefix: string
        }
        Insert: {
          degree_days: number
          low_temp_c: number
          prefix: string
        }
        Update: {
          degree_days?: number
          low_temp_c?: number
          prefix?: string
        }
        Relationships: []
      }
      radiator_types: {
        Row: {
          code: string
          description: string
        }
        Insert: {
          code: string
          description: string
        }
        Update: {
          code?: string
          description?: string
        }
        Relationships: []
      }
      remedials: {
        Row: {
          accepted_by: string | null
          accepted_on: string | null
          description: string
          id: string
          job_id: string
          photo_url: string | null
          raised_from: string | null
          raised_on: string
          rejected_note: string | null
        }
        Insert: {
          accepted_by?: string | null
          accepted_on?: string | null
          description: string
          id?: string
          job_id: string
          photo_url?: string | null
          raised_from?: string | null
          raised_on?: string
          rejected_note?: string | null
        }
        Update: {
          accepted_by?: string | null
          accepted_on?: string | null
          description?: string
          id?: string
          job_id?: string
          photo_url?: string | null
          raised_from?: string | null
          raised_on?: string
          rejected_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remedials_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remedials_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "remedials_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "remedials_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remedials_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "remedials_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "remedials_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "remedials_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "remedials_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "remedials_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      request_links: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          installer_id: string | null
          job_id: string | null
          purpose: string
          recipient_email: string | null
          recipient_role: Database["public"]["Enums"]["party_role"] | null
          requirement_ids: string[]
          token_hash: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at: string
          id?: string
          installer_id?: string | null
          job_id?: string | null
          purpose: string
          recipient_email?: string | null
          recipient_role?: Database["public"]["Enums"]["party_role"] | null
          requirement_ids?: string[]
          token_hash: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          installer_id?: string | null
          job_id?: string | null
          purpose?: string
          recipient_email?: string | null
          recipient_role?: Database["public"]["Enums"]["party_role"] | null
          requirement_ids?: string[]
          token_hash?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_links_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installer_onboarding"
            referencedColumns: ["installer_id"]
          },
          {
            foreignKeyName: "request_links_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_links_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "request_links_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "request_links_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_links_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "request_links_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "request_links_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "request_links_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "request_links_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "request_links_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          active: boolean
          any_of_group: string | null
          auto_check: string | null
          blocks_gate: Database["public"]["Enums"]["gate"] | null
          code: string
          condition: Database["public"]["Enums"]["req_condition"]
          default_requested_from:
            | Database["public"]["Enums"]["party_role"]
            | null
          description: string | null
          id: string
          job_type: Database["public"]["Enums"]["job_type"] | null
          kind: Database["public"]["Enums"]["req_kind"]
          label: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          any_of_group?: string | null
          auto_check?: string | null
          blocks_gate?: Database["public"]["Enums"]["gate"] | null
          code: string
          condition?: Database["public"]["Enums"]["req_condition"]
          default_requested_from?:
            | Database["public"]["Enums"]["party_role"]
            | null
          description?: string | null
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"] | null
          kind: Database["public"]["Enums"]["req_kind"]
          label: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          any_of_group?: string | null
          auto_check?: string | null
          blocks_gate?: Database["public"]["Enums"]["gate"] | null
          code?: string
          condition?: Database["public"]["Enums"]["req_condition"]
          default_requested_from?:
            | Database["public"]["Enums"]["party_role"]
            | null
          description?: string | null
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"] | null
          kind?: Database["public"]["Enums"]["req_kind"]
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      room_emitters: {
        Row: {
          age_years: number | null
          comments: string | null
          height_mm: number | null
          id: string
          length_mm: number | null
          radiator_type_code: string | null
          role: string
          room_id: string
          wall_height_m: number | null
          wall_length_m: number | null
        }
        Insert: {
          age_years?: number | null
          comments?: string | null
          height_mm?: number | null
          id?: string
          length_mm?: number | null
          radiator_type_code?: string | null
          role: string
          room_id: string
          wall_height_m?: number | null
          wall_length_m?: number | null
        }
        Update: {
          age_years?: number | null
          comments?: string | null
          height_mm?: number | null
          id?: string
          length_mm?: number | null
          radiator_type_code?: string | null
          role?: string
          room_id?: string
          wall_height_m?: number | null
          wall_length_m?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "room_emitters_radiator_type_code_fkey"
            columns: ["radiator_type_code"]
            isOneToOne: false
            referencedRelation: "radiator_types"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "room_emitters_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "survey_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_openings: {
        Row: {
          height_m: number
          id: string
          kind: string
          room_id: string
          type_category: string | null
          type_code: string
          width_m: number
        }
        Insert: {
          height_m: number
          id?: string
          kind: string
          room_id: string
          type_category?: string | null
          type_code: string
          width_m: number
        }
        Update: {
          height_m?: number
          id?: string
          kind?: string
          room_id?: string
          type_category?: string | null
          type_code?: string
          width_m?: number
        }
        Relationships: [
          {
            foreignKeyName: "room_openings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "survey_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_openings_type_code_type_category_fkey"
            columns: ["type_code", "type_category"]
            isOneToOne: false
            referencedRelation: "opening_types"
            referencedColumns: ["code", "category"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          note: string | null
          value: string
        }
        Insert: {
          key: string
          note?: string | null
          value: string
        }
        Update: {
          key?: string
          note?: string | null
          value?: string
        }
        Relationships: []
      }
      spec_versions: {
        Row: {
          changes_requested: string | null
          created_at: string
          heat_loss_pdf_url: string | null
          homeowner_approved_at: string | null
          homeowner_evidence: string | null
          id: string
          installer_approved_at: string | null
          installer_evidence: string | null
          job_id: string
          sent_on: string | null
          version: number
        }
        Insert: {
          changes_requested?: string | null
          created_at?: string
          heat_loss_pdf_url?: string | null
          homeowner_approved_at?: string | null
          homeowner_evidence?: string | null
          id?: string
          installer_approved_at?: string | null
          installer_evidence?: string | null
          job_id: string
          sent_on?: string | null
          version: number
        }
        Update: {
          changes_requested?: string | null
          created_at?: string
          heat_loss_pdf_url?: string | null
          homeowner_approved_at?: string | null
          homeowner_evidence?: string | null
          id?: string
          installer_approved_at?: string | null
          installer_evidence?: string | null
          job_id?: string
          sent_on?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          active: boolean
          auth_user_id: string | null
          email: string | null
          id: string
          name: string
          role: string
        }
        Insert: {
          active?: boolean
          auth_user_id?: string | null
          email?: string | null
          id?: string
          name: string
          role?: string
        }
        Update: {
          active?: boolean
          auth_user_id?: string | null
          email?: string | null
          id?: string
          name?: string
          role?: string
        }
        Relationships: []
      }
      supervision_matrix: {
        Row: {
          colour: Database["public"]["Enums"]["supervision_colour"]
          level: Database["public"]["Enums"]["operative_level"]
          risk: Database["public"]["Enums"]["risk_level"]
        }
        Insert: {
          colour: Database["public"]["Enums"]["supervision_colour"]
          level: Database["public"]["Enums"]["operative_level"]
          risk: Database["public"]["Enums"]["risk_level"]
        }
        Update: {
          colour?: Database["public"]["Enums"]["supervision_colour"]
          level?: Database["public"]["Enums"]["operative_level"]
          risk?: Database["public"]["Enums"]["risk_level"]
        }
        Relationships: []
      }
      survey_rooms: {
        Row: {
          comments: string | null
          floor_covering: string | null
          id: string
          name: string
          sort_order: number
          survey_id: string
          ufh_pipe_centres_mm: number | null
        }
        Insert: {
          comments?: string | null
          floor_covering?: string | null
          id?: string
          name: string
          sort_order?: number
          survey_id: string
          ufh_pipe_centres_mm?: number | null
        }
        Update: {
          comments?: string | null
          floor_covering?: string | null
          id?: string
          name?: string
          sort_order?: number
          survey_id?: string
          ufh_pipe_centres_mm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_rooms_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          bedrooms: number | null
          building_regs_noncompliance: boolean | null
          completed_by_name: string | null
          completed_by_role: Database["public"]["Enums"]["party_role"] | null
          cutout_photo_url: string | null
          cylinder_cupboard_notes: string | null
          cylinder_location: string | null
          design_notes: string | null
          electricity_pence_kwh: number | null
          electricity_phase: string | null
          epc_needed_for_bus: boolean | null
          epc_valid: boolean | null
          existing_fuel_pence_kwh: number | null
          existing_fuel_type: string | null
          existing_heat_source: string | null
          exposed_location: boolean | null
          floors: number | null
          form_kind: string
          fuse_rating_a: number | null
          heat_pump_type: string | null
          house_type: string | null
          hp_location: string | null
          id: string
          job_id: string
          listed_or_conservation: boolean | null
          mpan: string | null
          occupants: number | null
          occupied_over_50pct: boolean | null
          other_planning_issues: string | null
          permitted_development: boolean | null
          planning_permission_may_be_needed: boolean | null
          property_use: string | null
          proposed_emitter_types: string | null
          protected_species: boolean | null
          r290_zones_measured: boolean | null
          self_build: boolean | null
          status: Database["public"]["Enums"]["survey_status"]
          submitted_at: string | null
          supply_connected: boolean | null
          surveyed_on: string | null
          surveyor_id: string | null
          updated_at: string
          year_built: number | null
        }
        Insert: {
          bedrooms?: number | null
          building_regs_noncompliance?: boolean | null
          completed_by_name?: string | null
          completed_by_role?: Database["public"]["Enums"]["party_role"] | null
          cutout_photo_url?: string | null
          cylinder_cupboard_notes?: string | null
          cylinder_location?: string | null
          design_notes?: string | null
          electricity_pence_kwh?: number | null
          electricity_phase?: string | null
          epc_needed_for_bus?: boolean | null
          epc_valid?: boolean | null
          existing_fuel_pence_kwh?: number | null
          existing_fuel_type?: string | null
          existing_heat_source?: string | null
          exposed_location?: boolean | null
          floors?: number | null
          form_kind?: string
          fuse_rating_a?: number | null
          heat_pump_type?: string | null
          house_type?: string | null
          hp_location?: string | null
          id?: string
          job_id: string
          listed_or_conservation?: boolean | null
          mpan?: string | null
          occupants?: number | null
          occupied_over_50pct?: boolean | null
          other_planning_issues?: string | null
          permitted_development?: boolean | null
          planning_permission_may_be_needed?: boolean | null
          property_use?: string | null
          proposed_emitter_types?: string | null
          protected_species?: boolean | null
          r290_zones_measured?: boolean | null
          self_build?: boolean | null
          status?: Database["public"]["Enums"]["survey_status"]
          submitted_at?: string | null
          supply_connected?: boolean | null
          surveyed_on?: string | null
          surveyor_id?: string | null
          updated_at?: string
          year_built?: number | null
        }
        Update: {
          bedrooms?: number | null
          building_regs_noncompliance?: boolean | null
          completed_by_name?: string | null
          completed_by_role?: Database["public"]["Enums"]["party_role"] | null
          cutout_photo_url?: string | null
          cylinder_cupboard_notes?: string | null
          cylinder_location?: string | null
          design_notes?: string | null
          electricity_pence_kwh?: number | null
          electricity_phase?: string | null
          epc_needed_for_bus?: boolean | null
          epc_valid?: boolean | null
          existing_fuel_pence_kwh?: number | null
          existing_fuel_type?: string | null
          existing_heat_source?: string | null
          exposed_location?: boolean | null
          floors?: number | null
          form_kind?: string
          fuse_rating_a?: number | null
          heat_pump_type?: string | null
          house_type?: string | null
          hp_location?: string | null
          id?: string
          job_id?: string
          listed_or_conservation?: boolean | null
          mpan?: string | null
          occupants?: number | null
          occupied_over_50pct?: boolean | null
          other_planning_issues?: string | null
          permitted_development?: boolean | null
          planning_permission_may_be_needed?: boolean | null
          property_use?: string | null
          proposed_emitter_types?: string | null
          protected_species?: boolean | null
          r290_zones_measured?: boolean | null
          self_build?: boolean | null
          status?: Database["public"]["Enums"]["survey_status"]
          submitted_at?: string | null
          supply_connected?: boolean | null
          surveyed_on?: string | null
          surveyor_id?: string | null
          updated_at?: string
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "surveys_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "surveys_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "surveys_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "surveys_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "surveys_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "surveys_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "surveys_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_surveyor_id_fkey"
            columns: ["surveyor_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      assessment_position_calc: {
        Row: {
          assessed_on: string | null
          attenuation_db: number | null
          barrier_class: Database["public"]["Enums"]["barrier_class"] | null
          barrier_type_code: string | null
          distance_m: number | null
          habitable_confirmed: boolean | null
          id: string | null
          is_complete: boolean | null
          is_stale: boolean | null
          job_id: string | null
          line_of_sight: Database["public"]["Enums"]["line_of_sight"] | null
          max_lw_db: number | null
          notes: string | null
          photo_url: string | null
          property_description: string | null
          q: number | null
          reflective_surfaces: number | null
          source: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_positions_barrier_type_code_fkey"
            columns: ["barrier_type_code"]
            isOneToOne: false
            referencedRelation: "barrier_types"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "assessment_positions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_deadlines: {
        Row: {
          acknowledge_by: string | null
          id: string | null
          job_id: string | null
          respond_by: string | null
          visit_by: string | null
        }
        Insert: {
          acknowledge_by?: never
          id?: string | null
          job_id?: string | null
          respond_by?: never
          visit_by?: never
        }
        Update: {
          acknowledge_by?: never
          id?: string | null
          job_id?: string | null
          respond_by?: never
          visit_by?: never
        }
        Relationships: [
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "complaints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      credential_expiry: {
        Row: {
          days_left: number | null
          expired: boolean | null
          expires_on: string | null
          id: string | null
          installer_id: string | null
          label: string | null
          operative_id: string | null
          operative_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operatives_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installer_onboarding"
            referencedColumns: ["installer_id"]
          },
          {
            foreignKeyName: "operatives_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installers"
            referencedColumns: ["id"]
          },
        ]
      }
      installer_onboarding: {
        Row: {
          installer_id: string | null
          missing: string[] | null
          name: string | null
        }
        Insert: {
          installer_id?: string | null
          missing?: never
          name?: string | null
        }
        Update: {
          installer_id?: string | null
          missing?: never
          name?: string | null
        }
        Relationships: []
      }
      installer_payouts_due: {
        Row: {
          amount: number | null
          homeowner_paid_on: string | null
          id: string | null
          installer_id: string | null
          job_id: string | null
          job_payment_id: string | null
          paid_on: string | null
          payment_run: string | null
          reference: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installer_payouts_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installer_onboarding"
            referencedColumns: ["installer_id"]
          },
          {
            foreignKeyName: "installer_payouts_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "installer_payouts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installer_payouts_job_payment_id_fkey"
            columns: ["job_payment_id"]
            isOneToOne: false
            referencedRelation: "job_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      job_bus: {
        Row: {
          applied_on: string | null
          assisted_digital: boolean | null
          consent_given_on: string | null
          consent_requested_on: string | null
          figures_differ_from_quote: boolean | null
          id: string | null
          info_requested_on: string | null
          info_responded_on: string | null
          job_id: string | null
          redeemed_amount: number | null
          redeemed_on: string | null
          reference: string | null
          rejected_on: string | null
          submitted_grant: number | null
          submitted_heat_pump_cost: number | null
          submitted_quote_date: string | null
          submitted_quote_ref: string | null
          submitted_total_before_grant: number | null
          voucher_expires_on: string | null
          voucher_id: string | null
          voucher_issued_on: string | null
          withdrawn_on: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "bus_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_checkpoint_status: {
        Row: {
          accepted: boolean | null
          code: string | null
          job_id: string | null
          label: string | null
          sort_order: number | null
          submitted: boolean | null
        }
        Relationships: []
      }
      job_current_spec: {
        Row: {
          approved: boolean | null
          changes_requested: string | null
          created_at: string | null
          heat_loss_pdf_url: string | null
          homeowner_approved_at: string | null
          homeowner_evidence: string | null
          id: string | null
          installer_approved_at: string | null
          installer_evidence: string | null
          job_id: string | null
          sent_on: string | null
          version: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "spec_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_deadlines: {
        Row: {
          code: string | null
          days_left: number | null
          done_on: string | null
          due_on: string | null
          job_id: string | null
          label: string | null
          source: string | null
          status: string | null
        }
        Relationships: []
      }
      job_dno: {
        Row: {
          application_type: string | null
          approval_needed_before_install: boolean | null
          approved_on: string | null
          id: string | null
          job_id: string | null
          notes: string | null
          passed_to_dno_on: string | null
          reference: string | null
          submitted_on: string | null
          withdrawn_on: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "dno_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_facts: {
        Row: {
          all_paid: boolean | null
          assignee_id: string | null
          bus_grant_amount: number | null
          bus_redeemed_on: string | null
          cancelled_at: string | null
          cancelled_reason: string | null
          contract_signed_on: string | null
          contract_value: number | null
          created_at: string | null
          crm_ref: string | null
          dno_approved_on: string | null
          dno_needed_before_install: boolean | null
          drive_folder_url: string | null
          easymcs_project_ref: string | null
          enquiry_contact_email: string | null
          enquiry_contact_name: string | null
          enquiry_contact_phone: string | null
          enquiry_contact_role: Database["public"]["Enums"]["party_role"] | null
          enquiry_notes: string | null
          epc_expires_on: string | null
          estimated_heat_loss_kw: number | null
          estimated_unit_id: string | null
          existing_heating_type: string | null
          express_consent_signed_on: string | null
          final_heat_loss_kw: number | null
          final_unit_id: string | null
          final_unit_passes: boolean | null
          guarantee_sent_on: string | null
          has_cylinder: boolean | null
          heat_loss_pdf_url: string | null
          heat_pump_cost: number | null
          hies_completion_on: string | null
          hies_registered_on: string | null
          homeowner_email: string | null
          homeowner_name: string | null
          homeowner_phone: string | null
          id: string | null
          id_check_failed: boolean | null
          install_address_id: string | null
          installer_id: string | null
          installer_missing: string[] | null
          job_ref: string | null
          job_type: Database["public"]["Enums"]["job_type"] | null
          lead_level: Database["public"]["Enums"]["operative_level"] | null
          main_contractor_email: string | null
          main_contractor_name: string | null
          manufacturer_id: string | null
          milestones: string[] | null
          on_hold_reason: string | null
          on_hold_review_on: string | null
          owner_residential_address_id: string | null
          planned_install_finish: string | null
          planned_install_start: string | null
          preferred_cylinder_make: string | null
          quote_date: string | null
          quote_ref: string | null
          quote_total_before_grant: number | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          risk_reasoning: string | null
          scheduled_total: number | null
          spec_approved: boolean | null
          spec_version: number | null
          spec_version_id: string | null
          stage: Database["public"]["Enums"]["job_stage"] | null
          supervised_without_skilled: boolean | null
          supervision_approach: string | null
          supervision_colour:
            | Database["public"]["Enums"]["supervision_colour"]
            | null
          technical_supervisor_id: string | null
          technology: Database["public"]["Enums"]["technology"] | null
          updated_at: string | null
          uses_bus_grant: boolean | null
          voucher_expires_on: string | null
          voucher_issued_on: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_estimated_unit_id_fkey"
            columns: ["estimated_unit_id"]
            isOneToOne: false
            referencedRelation: "heat_pump_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_final_unit_id_fkey"
            columns: ["final_unit_id"]
            isOneToOne: false
            referencedRelation: "heat_pump_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_install_address_id_fkey"
            columns: ["install_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installer_onboarding"
            referencedColumns: ["installer_id"]
          },
          {
            foreignKeyName: "jobs_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_owner_residential_address_id_fkey"
            columns: ["owner_residential_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_technical_supervisor_id_fkey"
            columns: ["technical_supervisor_id"]
            isOneToOne: false
            referencedRelation: "credential_expiry"
            referencedColumns: ["operative_id"]
          },
          {
            foreignKeyName: "jobs_technical_supervisor_id_fkey"
            columns: ["technical_supervisor_id"]
            isOneToOne: false
            referencedRelation: "operatives"
            referencedColumns: ["id"]
          },
        ]
      }
      job_gaps: {
        Row: {
          blocking: boolean | null
          blocks_gate: Database["public"]["Enums"]["gate"] | null
          job_id: string | null
          label: string | null
          requested_from: Database["public"]["Enums"]["party_role"] | null
          sort_order: number | null
          source: string | null
        }
        Relationships: []
      }
      job_gate_checks: {
        Row: {
          code: string | null
          gate: Database["public"]["Enums"]["gate"] | null
          job_id: string | null
          label: string | null
          met: boolean | null
          requested_from: Database["public"]["Enums"]["party_role"] | null
        }
        Relationships: []
      }
      job_gate_readiness: {
        Row: {
          gate: Database["public"]["Enums"]["gate"] | null
          job_id: string | null
          job_ref: string | null
          ready: boolean | null
          unmet: number | null
        }
        Relationships: []
      }
      job_money: {
        Row: {
          all_paid: boolean | null
          contract_value: number | null
          deposit_cover_limit: number | null
          job_id: string | null
          mismatched_payments: number | null
          overdue_payments: number | null
          paid_total: number | null
          scheduled_total: number | null
          upfront_total: number | null
        }
        Relationships: []
      }
      job_requirement_units: {
        Row: {
          blocks_gate: Database["public"]["Enums"]["gate"] | null
          is_met: boolean | null
          job_id: string | null
          label: string | null
          requested_from: Database["public"]["Enums"]["party_role"] | null
          sort_order: number | null
          unit_key: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_checkpoint_status"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_deadlines"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_checks"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_gate_readiness"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_money"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sound_check"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_supervision"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_sound_check: {
        Row: {
          any_stale: boolean | null
          estimated_lw: number | null
          estimated_model: string | null
          estimated_unit_passes: boolean | null
          final_lw: number | null
          final_model: string | null
          final_unit_passes: boolean | null
          job_id: string | null
          job_ref: string | null
          n_positions: number | null
          recheck_sound: boolean | null
          site_limit_lw: number | null
          unit_review_needed: boolean | null
        }
        Relationships: []
      }
      job_supervision: {
        Row: {
          colour: Database["public"]["Enums"]["supervision_colour"] | null
          job_id: string | null
          lead_level: Database["public"]["Enums"]["operative_level"] | null
          lead_operative_id: string | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          supervised_without_skilled: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "job_operatives_operative_id_fkey"
            columns: ["lead_operative_id"]
            isOneToOne: false
            referencedRelation: "credential_expiry"
            referencedColumns: ["operative_id"]
          },
          {
            foreignKeyName: "job_operatives_operative_id_fkey"
            columns: ["lead_operative_id"]
            isOneToOne: false
            referencedRelation: "operatives"
            referencedColumns: ["id"]
          },
        ]
      }
      nonconformity_deadlines: {
        Row: {
          id: string | null
          overdue: boolean | null
          plan_due_on: string | null
        }
        Insert: {
          id?: string | null
          overdue?: never
          plan_due_on?: never
        }
        Update: {
          id?: string | null
          overdue?: never
          plan_due_on?: never
        }
        Relationships: []
      }
      operative_level_check: {
        Row: {
          differs: boolean | null
          operative_id: string | null
          recorded_level: Database["public"]["Enums"]["operative_level"] | null
          suggested_level: Database["public"]["Enums"]["operative_level"] | null
          technology: Database["public"]["Enums"]["technology"] | null
        }
        Relationships: [
          {
            foreignKeyName: "operative_levels_operative_id_fkey"
            columns: ["operative_id"]
            isOneToOne: false
            referencedRelation: "credential_expiry"
            referencedColumns: ["operative_id"]
          },
          {
            foreignKeyName: "operative_levels_operative_id_fkey"
            columns: ["operative_id"]
            isOneToOne: false
            referencedRelation: "operatives"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_working_days: {
        Args: { p_days: number; p_from: string }
        Returns: string
      }
      generate_job_requirements: { Args: { p_job: string }; Returns: number }
      is_staff: { Args: never; Returns: boolean }
      max_sound_power_db: {
        Args: { attenuation: number; lim?: number; q: number; r: number }
        Returns: number
      }
      milestone_on: { Args: { p_code: string; p_job: string }; Returns: string }
      next_payment_run: { Args: { p_from: string }; Returns: string }
      sound_pressure_db: {
        Args: { attenuation: number; lw: number; q: number; r: number }
        Returns: number
      }
      submit_survey: { Args: { p_survey: string }; Returns: undefined }
      survey_problems: {
        Args: { p_survey: string }
        Returns: {
          message: string
          severity: string
        }[]
      }
      sync_job_requirements: { Args: { p_job: string }; Returns: undefined }
    }
    Enums: {
      actor_kind: "staff" | "bot" | "external_link" | "system"
      barrier_class: "type_1" | "type_2" | "none"
      gate:
        | "setup_complete"
        | "heat_loss"
        | "send_spec"
        | "contract"
        | "dno"
        | "bus_application"
        | "ready_to_install"
        | "switch_on"
        | "certification"
        | "close"
      job_stage:
        | "enquiry"
        | "job_setup"
        | "survey"
        | "design"
        | "approval"
        | "contract"
        | "applications"
        | "installation"
        | "commissioning"
        | "certification"
        | "closing"
        | "closed"
      job_type: "retrofit" | "new_build"
      line_of_sight: "no_view" | "partial_view" | "full_view"
      operative_level: "skilled_qualified" | "skilled" | "supervised"
      party_role:
        | "installer"
        | "homeowner"
        | "main_contractor"
        | "surveyor"
        | "internal"
      req_condition: "always" | "id_check_failed"
      req_kind: "data" | "document" | "form"
      req_status: "missing" | "requested" | "received" | "waived"
      risk_level: "low" | "medium" | "high"
      supervision_colour: "green" | "amber" | "red"
      survey_status: "draft" | "submitted"
      technology:
        | "air_source_heat_pump"
        | "ground_source_heat_pump"
        | "solar_pv"
        | "battery_storage"
        | "solar_thermal"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      actor_kind: ["staff", "bot", "external_link", "system"],
      barrier_class: ["type_1", "type_2", "none"],
      gate: [
        "setup_complete",
        "heat_loss",
        "send_spec",
        "contract",
        "dno",
        "bus_application",
        "ready_to_install",
        "switch_on",
        "certification",
        "close",
      ],
      job_stage: [
        "enquiry",
        "job_setup",
        "survey",
        "design",
        "approval",
        "contract",
        "applications",
        "installation",
        "commissioning",
        "certification",
        "closing",
        "closed",
      ],
      job_type: ["retrofit", "new_build"],
      line_of_sight: ["no_view", "partial_view", "full_view"],
      operative_level: ["skilled_qualified", "skilled", "supervised"],
      party_role: [
        "installer",
        "homeowner",
        "main_contractor",
        "surveyor",
        "internal",
      ],
      req_condition: ["always", "id_check_failed"],
      req_kind: ["data", "document", "form"],
      req_status: ["missing", "requested", "received", "waived"],
      risk_level: ["low", "medium", "high"],
      supervision_colour: ["green", "amber", "red"],
      survey_status: ["draft", "submitted"],
      technology: [
        "air_source_heat_pump",
        "ground_source_heat_pump",
        "solar_pv",
        "battery_storage",
        "solar_thermal",
      ],
    },
  },
} as const
