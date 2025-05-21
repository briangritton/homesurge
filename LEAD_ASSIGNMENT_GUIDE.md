# Lead Assignment System Guide

This document explains how the automatic lead assignment system works and how to configure it.

## Overview

The lead assignment system distributes new leads to your sales representatives based on workload balancing. It can work in two modes:

1. **Automatic Assignment**: New leads are automatically assigned when they are created
2. **Manual Assignment**: Admins can manually trigger assignment for unassigned leads

## Assignment Criteria

Leads are assigned based on the following criteria:

1. **Workload Balance**: Leads are assigned to the sales rep with the lowest current lead count
2. **Active Status**: Only active sales reps are considered for assignments
3. **Availability**: Sales reps must be marked as active in the system

This creates an even distribution of leads across your team, ensuring no single rep gets overloaded.

## Configuring Auto-Assignment

1. Go to the CRM Admin dashboard
2. Navigate to the "Lead Auto-Assignment" section
3. Toggle the "Auto-assignment enabled" switch to turn the feature on or off
4. Click "Save Settings" to apply your changes

## Manually Assigning Leads

If auto-assignment is disabled or you have a backlog of unassigned leads:

1. Go to the CRM Admin dashboard
2. Navigate to the "Lead Auto-Assignment" section  
3. Click the "Assign All Unassigned Leads" button
4. The system will assign all unassigned leads to your sales team
5. Review the assignment results displayed on the screen

## Sales Rep Setup for Notifications

For sales reps to receive WhatsApp notifications when leads are assigned:

1. When creating a new sales rep account, enter their phone number with country code (e.g., +15551234567)
2. Ensure the phone number has WhatsApp installed and activated
3. The sales rep should have opted-in to receive WhatsApp messages from your business number

## Modifying Assignment Logic

The current assignment logic is based on workload balancing. If you need to modify this logic:

### Current Logic (in src/services/assignment.js):
```javascript
// Get sales reps sorted by current load
const repsWithLoad = await getSalesRepsWithLoadCount();

// Assign to the sales rep with the lowest load
const targetRep = repsWithLoad[0];
const success = await assignLeadToSalesRep(leadId, targetRep.id);
```

### Alternative Assignment Criteria

If you want to change the assignment criteria, you would need to modify the `autoAssignLead` function in `src/services/assignment.js`. Here are some alternative approaches:

1. **Round Robin**: Assign leads sequentially to each rep regardless of current load
2. **Geographic**: Assign based on the lead's location and rep's territory
3. **Lead Value**: Assign higher-value leads to more experienced reps
4. **Specialization**: Assign leads based on property type or customer needs

## Monitoring Assignment Performance

You can monitor the performance of your lead assignment system:

1. The "Sales Team Workload" section shows each rep's current lead count
2. After running a manual assignment, detailed statistics are displayed
3. You can view which leads were assigned to which reps

## Troubleshooting

If leads aren't being assigned properly:

1. Check that you have active sales reps in the system
2. Verify that auto-assignment is enabled if you want automatic assignment
3. Ensure sales reps have valid WhatsApp-enabled phone numbers
4. Check the browser console and server logs for any errors