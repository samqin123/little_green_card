import { ClinicalTrial } from "../types";

export const fetchClinicalTrials = async (cancerType: string): Promise<ClinicalTrial[]> => {
  // Translate simplified Chinese cancer types to English for the API query
  const queryTerm = cancerType.includes('胰腺') ? 'Pancreatic Cancer' : 'Lung Cancer';
  
  // API v2 Endpoint
  // Filter for Recruiting status
  // Sort by lastUpdateSubmitDate to get recent trials
  const url = `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(queryTerm)}&filter.overallStatus=RECRUITING&pageSize=6&sort=lastUpdateSubmitDate`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Clinical Trials API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.studies) return [];

    return data.studies.map((study: any) => {
        const protocolModule = study.protocolSection?.identificationModule;
        const statusModule = study.protocolSection?.statusModule;
        const descModule = study.protocolSection?.descriptionModule;
        const orgModule = study.protocolSection?.identificationModule?.organization;
        const locationsModule = study.protocolSection?.contactsLocationsModule;
        const conditionsModule = study.protocolSection?.conditionsModule;
        const armsInterventionsModule = study.protocolSection?.armsInterventionsModule;
        const designModule = study.protocolSection?.designModule;

        const locations = locationsModule?.locations || [];

        return {
            nctId: protocolModule?.nctId || 'N/A',
            briefTitle: protocolModule?.briefTitle || 'No Title',
            organization: orgModule?.fullName || 'Unknown Organization',
            status: statusModule?.overallStatus || 'Unknown',
            summary: descModule?.briefSummary || 'No summary available.',
            lastUpdateSubmitDate: statusModule?.lastUpdateSubmitDate,
            locations: locations.slice(0, 5).map((l: any) => `${l.city}, ${l.country}`), // Take top 5 locations
            conditions: conditionsModule?.conditions || [],
            interventions: armsInterventionsModule?.interventions?.map((i: any) => `${i.name}`) || [],
            phases: designModule?.phases || []
        };
    });
  } catch (error) {
    console.error("Failed to fetch clinical trials", error);
    return []; // Return empty array on error to not break the UI
  }
};