'use strict';

/**
 * Structured Medical Knowledge Base
 *
 * Replaces the old hardcoded template system with composable knowledge units.
 * Each finding type has associated clinical significance, severity criteria,
 * differential diagnoses, and evidence-based recommendations.
 *
 * This is NOT a template — the reasoning engine composes unique reports by
 * combining relevant knowledge units based on actual model findings.
 */
const medicalKnowledge = {

  // ── Finding-specific knowledge ──────────────────────────────────────────
  findings: {
    'No Finding': {
      clinicalSignificance: 'No acute pathology identified on the current study.',
      severityCriteria: { normal: 'No abnormality detected' },
      differentials: ['Early or occult pathology below detection threshold', 'Technique-related artifact'],
      recommendations: [
        'No immediate follow-up imaging required.',
        'Continue routine health screening as clinically indicated.',
      ],
      urgency: 'routine',
    },

    'Atelectasis': {
      clinicalSignificance: 'Collapse or incomplete expansion of lung tissue, resulting in reduced gas exchange.',
      severityCriteria: {
        mild: 'Subsegmental or plate-like atelectasis with minimal volume loss',
        moderate: 'Segmental or lobar atelectasis with visible volume loss and mediastinal shift',
        severe: 'Complete lobar collapse with significant mediastinal shift',
      },
      differentials: ['Mucus plugging', 'Post-operative atelectasis', 'Endobronchial lesion', 'Extrinsic compression'],
      recommendations: [
        'Incentive spirometry and chest physiotherapy.',
        'Encourage deep breathing exercises and early ambulation.',
        'Follow-up chest radiograph in 48–72 hours to assess resolution.',
        'Consider bronchoscopy if lobar atelectasis persists despite conservative measures.',
      ],
      urgency: 'non-urgent',
    },

    'Cardiomegaly': {
      clinicalSignificance: 'Enlarged cardiac silhouette indicating possible underlying cardiac disease.',
      severityCriteria: {
        mild: 'Cardiothoracic ratio 0.50–0.55',
        moderate: 'Cardiothoracic ratio 0.55–0.65 with early vascular congestion',
        severe: 'Cardiothoracic ratio >0.65 with frank pulmonary edema or effusions',
      },
      differentials: ['Dilated cardiomyopathy', 'Pericardial effusion', 'Valvular heart disease', 'Hypertensive heart disease'],
      recommendations: [
        'Echocardiogram to evaluate cardiac function and ejection fraction.',
        'BNP/NT-proBNP level to assess severity of heart failure.',
        'Cardiology consultation for comprehensive cardiac evaluation.',
        'Optimize medical therapy including ACE inhibitor/ARB and beta-blocker as appropriate.',
      ],
      urgency: 'semi-urgent',
    },

    'Consolidation': {
      clinicalSignificance: 'Airspace opacification indicating fluid, pus, or cellular debris replacing normal air in the alveoli.',
      severityCriteria: {
        mild: 'Subsegmental consolidation without air bronchograms',
        moderate: 'Lobar consolidation with air bronchograms',
        severe: 'Multilobar consolidation or bilateral involvement',
      },
      differentials: ['Bacterial pneumonia', 'Aspiration pneumonia', 'Organizing pneumonia', 'Pulmonary hemorrhage', 'Malignant consolidation'],
      recommendations: [
        'Clinical correlation with symptoms, vitals, and laboratory findings.',
        'Blood cultures and sputum culture prior to antibiotic initiation if infection is suspected.',
        'Initiate empiric antibiotic therapy based on clinical setting and severity assessment.',
        'Follow-up chest radiograph in 6–8 weeks to confirm resolution.',
      ],
      urgency: 'semi-urgent',
    },

    'Edema': {
      clinicalSignificance: 'Accumulation of fluid in the pulmonary interstitium and alveoli, most commonly due to cardiac failure.',
      severityCriteria: {
        mild: 'Interstitial edema with peribronchial cuffing and Kerley B lines',
        moderate: 'Interstitial and early alveolar edema with upper lobe vascular diversion',
        severe: 'Frank alveolar edema with bilateral airspace opacities in bat-wing distribution',
      },
      differentials: ['Cardiogenic pulmonary edema', 'ARDS', 'Fluid overload', 'Renal failure', 'Neurogenic pulmonary edema'],
      recommendations: [
        'URGENT: Assess hemodynamic status and initiate diuretic therapy.',
        'Supplemental oxygen to maintain SpO2 ≥ 94%.',
        'Echocardiogram to evaluate cardiac function.',
        'BNP/NT-proBNP, troponin, and comprehensive metabolic panel.',
        'Consider non-invasive positive pressure ventilation if respiratory distress is present.',
      ],
      urgency: 'urgent',
    },

    'Effusion': {
      clinicalSignificance: 'Accumulation of fluid in the pleural space between the visceral and parietal pleura.',
      severityCriteria: {
        mild: 'Blunting of costophrenic angle without meniscus sign',
        moderate: 'Meniscus sign present, effusion tracking up the lateral chest wall',
        severe: 'Large effusion with opacification of more than half the hemithorax, possible mediastinal shift',
      },
      differentials: ['Transudative (CHF, cirrhosis, nephrotic syndrome)', 'Exudative (infection, malignancy)', 'Empyema', 'Hemothorax', 'Chylothorax'],
      recommendations: [
        'Thoracentesis for diagnostic and potentially therapeutic purposes.',
        'Pleural fluid analysis: protein, LDH, glucose, pH, cell count, culture, cytology.',
        'CT chest with contrast to evaluate underlying etiology.',
        'Ultrasound guidance for thoracentesis to minimize procedural complications.',
      ],
      urgency: 'semi-urgent',
    },

    'Emphysema': {
      clinicalSignificance: 'Destruction of alveolar walls leading to air trapping and reduced gas exchange surface area.',
      severityCriteria: {
        mild: 'Mild hyperinflation with slightly flattened diaphragms',
        moderate: 'Hyperinflated lungs with flattened diaphragms and increased AP diameter',
        severe: 'Severe hyperinflation with bullous changes and markedly attenuated vasculature',
      },
      differentials: ['COPD', 'Alpha-1 antitrypsin deficiency', 'Centrilobular emphysema', 'Panacinar emphysema'],
      recommendations: [
        'Pulmonary function testing (spirometry) to quantify airflow limitation.',
        'Initiate or optimize bronchodilator therapy as appropriate.',
        'Smoking cessation counseling and pharmacologic support.',
        'Annual influenza and pneumococcal vaccination.',
      ],
      urgency: 'non-urgent',
    },

    'Fibrosis': {
      clinicalSignificance: 'Scarring and thickening of pulmonary interstitium indicating chronic or end-stage lung disease.',
      severityCriteria: {
        mild: 'Fine reticular opacities limited to lung bases',
        moderate: 'Reticular opacities with early honeycombing at the bases',
        severe: 'Extensive honeycombing with traction bronchiectasis and volume loss',
      },
      differentials: ['Idiopathic pulmonary fibrosis', 'Connective tissue disease-associated ILD', 'Hypersensitivity pneumonitis', 'Asbestosis'],
      recommendations: [
        'High-resolution CT (HRCT) chest for detailed characterization.',
        'Pulmonary function tests including DLCO measurement.',
        'Serological markers: ANA, RF, anti-CCP for connective tissue disease screening.',
        'Referral to pulmonology and multidisciplinary ILD team.',
      ],
      urgency: 'non-urgent',
    },

    'Hernia': {
      clinicalSignificance: 'Protrusion of abdominal contents through the diaphragm into the thoracic cavity.',
      severityCriteria: {
        mild: 'Small sliding hiatal hernia',
        moderate: 'Large hiatal or para-esophageal hernia',
        severe: 'Diaphragmatic hernia with significant thoracic organ displacement',
      },
      differentials: ['Hiatal hernia', 'Traumatic diaphragmatic hernia', 'Congenital diaphragmatic hernia', 'Bochdalek hernia'],
      recommendations: [
        'CT abdomen/pelvis for further characterization if clinically indicated.',
        'Upper GI series or endoscopy for symptomatic patients.',
        'Surgical consultation for large or symptomatic hernias.',
      ],
      urgency: 'non-urgent',
    },

    'Infiltration': {
      clinicalSignificance: 'Non-specific opacification pattern that may represent infectious, inflammatory, or neoplastic processes.',
      severityCriteria: {
        mild: 'Subtle increased opacity in a single region',
        moderate: 'Clear infiltrative pattern with defined margins',
        severe: 'Dense or multifocal infiltrates',
      },
      differentials: ['Pneumonia', 'Pulmonary hemorrhage', 'Organizing pneumonia', 'Eosinophilic pneumonia', 'Drug-induced lung disease'],
      recommendations: [
        'Clinical correlation with symptoms and laboratory findings.',
        'Consider CT chest for further characterization of infiltrative pattern.',
        'Sputum culture and blood work including CBC with differential.',
        'Follow-up imaging in 4–6 weeks to assess resolution.',
      ],
      urgency: 'semi-urgent',
    },

    'Mass': {
      clinicalSignificance: 'Pulmonary opacity greater than 3 cm — concerning for malignancy until proven otherwise.',
      severityCriteria: {
        mild: 'Well-defined mass with smooth margins and possible benign features',
        moderate: 'Mass with irregular or lobulated margins',
        severe: 'Spiculated mass with associated lymphadenopathy or pleural involvement',
      },
      differentials: ['Primary lung adenocarcinoma', 'Squamous cell carcinoma', 'Large cell carcinoma', 'Metastatic deposit', 'Pulmonary carcinoid', 'Hamartoma'],
      recommendations: [
        'URGENT: CT chest/abdomen/pelvis with contrast for staging evaluation.',
        'PET-CT for metabolic characterization and distant metastasis screening.',
        'CT-guided biopsy or bronchoscopy for tissue diagnosis.',
        'Brain MRI to evaluate for intracranial metastases.',
        'Urgent multidisciplinary tumor board discussion.',
      ],
      urgency: 'critical',
    },

    'Nodule': {
      clinicalSignificance: 'Focal opacity less than 3 cm in the lung parenchyma. Requires characterization and risk assessment.',
      severityCriteria: {
        mild: 'Nodule <6 mm with smooth margins',
        moderate: 'Nodule 6–8 mm or multiple small nodules',
        severe: 'Nodule >8 mm with irregular margins or associated features',
      },
      differentials: ['Granuloma', 'Primary lung malignancy', 'Metastatic deposit', 'Carcinoid tumor', 'Hamartoma', 'Arteriovenous malformation'],
      recommendations: [
        'CT chest without contrast for further characterization.',
        'Apply Fleischner Society guidelines based on nodule size and patient risk factors.',
        'PET-CT if CT features are suspicious for malignancy.',
        'Pulmonology referral for nodules >8 mm or with high-risk features.',
      ],
      urgency: 'semi-urgent',
    },

    'Pleural Thickening': {
      clinicalSignificance: 'Thickening of the pleural membrane, which may be focal or diffuse.',
      severityCriteria: {
        mild: 'Focal pleural thickening without calcification',
        moderate: 'Diffuse pleural thickening or calcified plaques',
        severe: 'Circumferential pleural thickening with lung restriction',
      },
      differentials: ['Prior infection (healed pleuritis)', 'Asbestos exposure', 'Mesothelioma', 'Post-surgical changes'],
      recommendations: [
        'CT chest for detailed evaluation of pleural thickening extent.',
        'Occupational exposure history assessment (asbestos, talc).',
        'Pulmonary function tests to assess for restrictive pattern.',
        'Biopsy consideration if malignancy is suspected.',
      ],
      urgency: 'non-urgent',
    },

    'Pneumonia': {
      clinicalSignificance: 'Infection of the lung parenchyma with inflammatory consolidation.',
      severityCriteria: {
        mild: 'Focal consolidation in a single lobe without complications',
        moderate: 'Consolidation with parapneumonic effusion or bilateral involvement',
        severe: 'Multilobar pneumonia with respiratory failure or sepsis',
      },
      differentials: ['Bacterial pneumonia', 'Viral pneumonia', 'Atypical pneumonia (Mycoplasma, Chlamydia)', 'Aspiration pneumonia', 'COVID-19 pneumonitis'],
      recommendations: [
        'Initiate appropriate antibiotic therapy based on clinical setting and severity.',
        'Blood cultures and sputum culture prior to antibiotic initiation.',
        'Follow-up chest radiograph in 6–8 weeks to confirm resolution.',
        'Consider CT chest if clinical improvement is not observed after 48–72 hours.',
      ],
      urgency: 'semi-urgent',
    },

    'Pneumothorax': {
      clinicalSignificance: 'Presence of air in the pleural space causing partial or complete lung collapse.',
      severityCriteria: {
        mild: 'Small pneumothorax (<2 cm from chest wall at apex)',
        moderate: 'Moderate pneumothorax (2–4 cm from chest wall)',
        severe: 'Large pneumothorax (>4 cm) or tension pneumothorax with mediastinal shift',
      },
      differentials: ['Primary spontaneous pneumothorax', 'Secondary spontaneous pneumothorax', 'Traumatic pneumothorax', 'Iatrogenic pneumothorax'],
      recommendations: [
        'URGENT: Assess for tension pneumothorax — mediastinal shift or hemodynamic instability requires immediate decompression.',
        'Chest tube thoracostomy or needle aspiration based on size and clinical stability.',
        'Serial chest radiographs to monitor resolution after intervention.',
        'Avoid positive pressure ventilation until pneumothorax is treated.',
        'Consider pleurodesis for recurrent pneumothorax.',
      ],
      urgency: 'critical',
    },
  },

  // ── Urgency level definitions ───────────────────────────────────────────
  urgencyLevels: {
    routine:     { label: 'Routine',     description: 'No acute findings requiring urgent attention' },
    'non-urgent':  { label: 'Non-Urgent',  description: 'Findings requiring follow-up but not immediate action' },
    'semi-urgent': { label: 'Semi-Urgent', description: 'Findings requiring timely clinical correlation and workup' },
    urgent:      { label: 'Urgent',      description: 'Findings requiring prompt clinical evaluation and intervention' },
    critical:    { label: 'Critical',    description: 'Findings requiring immediate life-saving intervention' },
  },

  /**
   * Get knowledge for a specific finding type.
   * @param {string} findingLabel - The abnormality label from the vision model
   * @returns {Object|null}
   */
  getKnowledge(findingLabel) {
    return this.findings[findingLabel] || null;
  },

  /**
   * Get severity-specific description.
   */
  getSeverityDescription(findingLabel, severity) {
    const knowledge = this.findings[findingLabel];
    if (!knowledge) return null;
    return knowledge.severityCriteria[severity] || null;
  },
};

module.exports = medicalKnowledge;
