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

    // ── Spine / MRI Findings ─────────────────────────────────────────────────
    'Disc Herniation': {
      clinicalSignificance: 'Displacement of disc material beyond the posterior vertebral body margin, potentially compressing neural elements.',
      severityCriteria: {
        mild: 'Focal disc protrusion with mild thecal sac contact, no neural compression',
        moderate: 'Disc extrusion with thecal sac indentation or unilateral nerve root contact',
        severe: 'Large extrusion or sequestration with significant cord or cauda equina compression',
      },
      differentials: ['Disc protrusion', 'Disc extrusion', 'Sequestered disc fragment', 'Epidural haematoma', 'Epidural abscess'],
      recommendations: [
        'MRI lumbar spine with and without contrast for full characterisation.',
        'Conservative management: analgesia, physiotherapy, and activity modification for 6–12 weeks.',
        'Epidural steroid injection for refractory radiculopathy.',
        'Neurosurgical consultation if neurological deficit, bowel/bladder dysfunction, or failure of conservative treatment.',
      ],
      urgency: 'semi-urgent',
    },

    'Spinal Canal Stenosis': {
      clinicalSignificance: 'Narrowing of the spinal canal causing compression of the thecal sac and nerve roots, producing neurogenic claudication.',
      severityCriteria: {
        mild: 'Mild canal narrowing with preserved CSF signal around the cauda equina',
        moderate: 'Moderate stenosis with partial obliteration of the thecal sac',
        severe: 'Severe stenosis with complete obliteration of the CSF space and crowding of nerve roots',
      },
      differentials: ['Degenerative spondylosis', 'Ligamentum flavum hypertrophy', 'Disc herniation', 'Spondylolisthesis', 'Congenital stenosis'],
      recommendations: [
        'Weight loss and core strengthening physiotherapy programme.',
        'Epidural steroid injections for symptomatic relief.',
        'Neurosurgical referral for decompressive laminectomy if conservative management fails.',
        'Post-operative MRI to confirm adequate decompression.',
      ],
      urgency: 'semi-urgent',
    },

    'Disc Degeneration': {
      clinicalSignificance: 'Age-related or accelerated loss of disc hydration and height, producing axial back pain and altered spinal biomechanics.',
      severityCriteria: {
        mild: 'Mild T2 signal loss with preserved disc height (Pfirrmann Grade II)',
        moderate: 'Moderate signal loss and disc height reduction (Pfirrmann Grade III–IV)',
        severe: 'Complete disc collapse with endplate changes (Pfirrmann Grade V / Modic changes)',
      },
      differentials: ['Normal ageing', 'Discogenic pain', 'Inflammatory spondyloarthropathy', 'Infection (discitis)'],
      recommendations: [
        'Physiotherapy focusing on spinal stabilisation.',
        'Intradiscal therapies or facet joint injections for pain management.',
        'Spinal fusion surgery for end-stage instability refractory to conservative care.',
      ],
      urgency: 'non-urgent',
    },

    'Spondylolisthesis': {
      clinicalSignificance: 'Anterior (or posterior) slippage of one vertebral body relative to the adjacent vertebra, causing spinal instability.',
      severityCriteria: {
        mild: 'Grade I: <25% slip',
        moderate: 'Grade II–III: 25–75% slip',
        severe: 'Grade IV–V: >75% or complete spondyloptosis',
      },
      differentials: ['Degenerative spondylolisthesis', 'Isthmic spondylolysis', 'Traumatic spondylolisthesis', 'Pathological slip'],
      recommendations: [
        'Weight-bearing lateral X-ray for dynamic instability assessment.',
        'Physiotherapy and bracing for low-grade slips.',
        'Neurosurgical consultation for high-grade slips or progressive neurological symptoms.',
        'Surgical decompression and fusion for unstable or symptomatic cases.',
      ],
      urgency: 'semi-urgent',
    },

    'Nerve Root Compression': {
      clinicalSignificance: 'Mechanical compression of a spinal nerve root producing radiculopathy with dermatomal pain, sensory loss, or weakness.',
      severityCriteria: {
        mild: 'Contact with nerve root without displacement',
        moderate: 'Displacement of the nerve root with foraminal compromise',
        severe: 'Complete foraminal occlusion with nerve root flattening or signal change',
      },
      differentials: ['Disc herniation', 'Foraminal stenosis', 'Perineural cyst', 'Tumour', 'Epidural abscess'],
      recommendations: [
        'MRI with dedicated nerve root evaluation.',
        'Selective nerve root block for diagnostic and therapeutic purposes.',
        'Neurosurgical consultation if motor deficit or refractory radiculopathy.',
      ],
      urgency: 'semi-urgent',
    },

    'Cauda Equina Compression': {
      clinicalSignificance: 'EMERGENCY: Compression of the cauda equina nerve roots producing saddle anaesthesia, bowel/bladder dysfunction, and bilateral leg weakness.',
      severityCriteria: {
        mild: 'Early compression without bladder dysfunction',
        moderate: 'Incomplete cauda equina syndrome with partial bladder retention',
        severe: 'Complete cauda equina syndrome with urinary retention and perineal anaesthesia',
      },
      differentials: ['Massive disc herniation', 'Epidural abscess', 'Epidural haematoma', 'Spinal metastasis', 'Lumbar stenosis'],
      recommendations: [
        'EMERGENCY: Urgent neurosurgical consultation — surgical decompression within 24–48 hours is time-critical.',
        'MRI whole spine to assess extent of compression.',
        'Catheterise if urinary retention is present.',
        'Do not delay surgical referral awaiting further imaging.',
      ],
      urgency: 'critical',
    },

    'Vertebral Compression Fracture': {
      clinicalSignificance: 'Partial or complete collapse of the vertebral body, most commonly due to osteoporosis or trauma.',
      severityCriteria: {
        mild: 'Mild anterior wedging <25% height loss',
        moderate: '25–40% height loss with partial collapse',
        severe: '>40% height loss or burst fracture with retropulsion into the canal',
      },
      differentials: ['Osteoporotic fracture', 'Traumatic fracture', 'Pathological fracture (metastasis, myeloma)', 'Kümmell disease'],
      recommendations: [
        'DEXA scan for bone mineral density assessment if osteoporotic aetiology suspected.',
        'Vertebroplasty or kyphoplasty for refractory pain in osteoporotic fractures.',
        'Bony staging (CT chest/abdomen/pelvis, bone scan) if malignancy suspected.',
        'Neurosurgical consultation for burst fracture with canal compromise.',
      ],
      urgency: 'urgent',
    },

    'Ligamentum Flavum Hypertrophy': {
      clinicalSignificance: 'Thickening and buckling of the posterior longitudinal ligament contributing to central canal stenosis.',
      severityCriteria: {
        mild: 'Ligamentum flavum 3–4 mm, minimal thecal indentation',
        moderate: '4–6 mm with partial canal compromise',
        severe: '>6 mm with significant posterior thecal sac compression',
      },
      differentials: ['Degenerative hypertrophy', 'Calcification / ossification', 'Epidural lipomatosis'],
      recommendations: [
        'Physiotherapy and anti-inflammatory medication for mild-moderate cases.',
        'Epidural steroid injection for symptom management.',
        'Surgical flavectomy or laminectomy for severe stenosis.',
      ],
      urgency: 'non-urgent',
    },

    'Facet Joint Arthropathy': {
      clinicalSignificance: 'Degenerative arthritis of the posterior facet joints producing axial back pain and potential lateral recess stenosis.',
      severityCriteria: {
        mild: 'Joint space narrowing without osteophytes',
        moderate: 'Osteophyte formation with partial foraminal encroachment',
        severe: 'Advanced arthrosis with synovial cyst formation and significant foraminal stenosis',
      },
      differentials: ['Degenerative facet disease', 'Inflammatory spondyloarthropathy', 'Septic facet joint', 'Synovial cyst'],
      recommendations: [
        'Facet joint corticosteroid injection for pain management.',
        'Radiofrequency ablation of medial branch nerves for sustained relief.',
        'Physiotherapy with spinal stabilisation exercises.',
      ],
      urgency: 'non-urgent',
    },

    'Scoliosis': {
      clinicalSignificance: 'Lateral curvature of the spine exceeding 10 degrees on Cobb angle measurement.',
      severityCriteria: {
        mild: 'Cobb angle 10–25°',
        moderate: 'Cobb angle 25–45°',
        severe: 'Cobb angle >45° — surgical threshold',
      },
      differentials: ['Adolescent idiopathic scoliosis', 'Degenerative scoliosis', 'Neuromuscular scoliosis', 'Congenital scoliosis'],
      recommendations: [
        'Erect full-length spine radiograph for Cobb angle measurement.',
        'Spinal bracing for curves 25–45° in skeletally immature patients.',
        'Orthopaedic spine surgery for curves >45° or rapidly progressive curves.',
        'MRI spine if neurological symptoms or atypical curve pattern.',
      ],
      urgency: 'non-urgent',
    },

    'Osteoporosis': {
      clinicalSignificance: 'Reduced bone mineral density increasing vertebral fracture risk — often radiographically apparent as diffuse osteopenia.',
      severityCriteria: {
        mild: 'Mild osteopenia — biconcave endplates',
        moderate: 'Moderate height loss across multiple levels',
        severe: 'Multiple compression fractures with progressive kyphosis',
      },
      differentials: ['Primary osteoporosis', 'Secondary osteoporosis (steroids, hyperparathyroidism)', 'Osteomalacia', 'Myeloma'],
      recommendations: [
        'DEXA scan for formal bone mineral density quantification (T-score).',
        'Calcium, vitamin D, and bisphosphonate therapy as per local guidelines.',
        'Endocrinology referral for secondary causes.',
        'Fall prevention programme.',
      ],
      urgency: 'non-urgent',
    },

    'Epidural Lipomatosis': {
      clinicalSignificance: 'Excessive accumulation of adipose tissue in the epidural space producing posterior thecal compression.',
      severityCriteria: {
        mild: 'Mild epidural fat with preserved thecal sac shape',
        moderate: 'Moderate compression with Y-shaped thecal sac on axial MRI',
        severe: 'Severe compression with complete obliteration of posterior epidural space',
      },
      differentials: ['Steroid-induced lipomatosis', 'Obesity-related lipomatosis', 'Cushing syndrome', 'Epidural abscess'],
      recommendations: [
        'Steroid dose reduction if iatrogenic aetiology confirmed.',
        'Weight management programme.',
        'Neurosurgical consultation for severe symptomatic cases.',
      ],
      urgency: 'non-urgent',
    },

    // ── Knee Findings ────────────────────────────────────────────────────────
    'Osteoarthritis': {
      clinicalSignificance: 'Degenerative joint disease with progressive articular cartilage loss — most common joint pathology worldwide.',
      severityCriteria: {
        mild: 'KL Grade I–II: minor osteophytes, possible joint space narrowing',
        moderate: 'KL Grade III: moderate narrowing with multiple osteophytes',
        severe: 'KL Grade IV: bone-on-bone contact with subchondral sclerosis and deformity',
      },
      differentials: ['Primary osteoarthritis', 'Post-traumatic arthritis', 'Inflammatory arthropathy', 'Crystal arthropathy'],
      recommendations: [
        'Weight loss, low-impact exercise, and physiotherapy as first-line.',
        'Intra-articular corticosteroid or hyaluronic acid injection for moderate symptoms.',
        'Knee arthroplasty (total or unicompartmental) for end-stage disease.',
        'NSAID therapy for pain with gastroprotection.',
      ],
      urgency: 'non-urgent',
    },

    'Osteophyte Formation': {
      clinicalSignificance: 'Marginal bony spurs forming at joint edges as a response to articular cartilage loss and mechanical instability.',
      severityCriteria: {
        mild: 'Small osteophytes without joint space compromise',
        moderate: 'Moderate osteophytes encroaching on joint space',
        severe: 'Large osteophytes causing mechanical impingement or loose bodies',
      },
      differentials: ['Degenerative arthritis', 'Diffuse idiopathic skeletal hyperostosis (DISH)', 'Post-traumatic spurs'],
      recommendations: [
        'Conservative management with physiotherapy and analgesia.',
        'Arthroscopic debridement for mechanical symptoms due to impinging osteophytes.',
        'Joint replacement for advanced degeneration.',
      ],
      urgency: 'non-urgent',
    },

    'Joint Space Narrowing': {
      clinicalSignificance: 'Reduction in the radiographic joint space reflecting loss of articular cartilage thickness.',
      severityCriteria: {
        mild: 'Mild narrowing — joint space preserved >50%',
        moderate: 'Moderate narrowing — 25–50% of normal joint space remains',
        severe: 'Severe narrowing — <25% remaining or bone-on-bone contact',
      },
      differentials: ['Osteoarthritis', 'Rheumatoid arthritis', 'Septic arthritis', 'Crystal arthropathy', 'Post-traumatic'],
      recommendations: [
        'Inflammatory marker panel (ESR, CRP, RF, anti-CCP) to exclude inflammatory aetiology.',
        'MRI for cartilage assessment if radiographic stage does not correlate with symptoms.',
        'Joint replacement if conservative management fails.',
      ],
      urgency: 'non-urgent',
    },

    'Subchondral Sclerosis': {
      clinicalSignificance: 'Increased bone density beneath the articular surface reflecting chronic mechanical overload or degenerative change.',
      severityCriteria: {
        mild: 'Focal sclerosis without deformity',
        moderate: 'Diffuse sclerosis with joint space reduction',
        severe: 'Extensive sclerosis with subchondral cyst formation and collapse',
      },
      differentials: ['Osteoarthritis', 'Avascular necrosis (early)', 'Stress reaction', 'Paget disease'],
      recommendations: [
        'Weight-bearing radiographs for joint space assessment.',
        'MRI if avascular necrosis or stress fracture is suspected.',
        'Orthopaedic referral for progressive cases.',
      ],
      urgency: 'non-urgent',
    },

    'Tibial Plateau Fracture': {
      clinicalSignificance: 'Intra-articular fracture of the proximal tibia at the knee joint, commonly from axial loading or valgus/varus stress.',
      severityCriteria: {
        mild: 'Schatzker I–II: lateral plateau split or split-depression fracture',
        moderate: 'Schatzker III–IV: depression or medial fracture',
        severe: 'Schatzker V–VI: bicondylar or metaphyseal dissociation fracture',
      },
      differentials: ['Stress fracture', 'Pathological fracture', 'Bone contusion (MRI)'],
      recommendations: [
        'CT knee for fracture characterisation (step-off, depression, comminution).',
        'Non-weight-bearing and orthopaedic review — surgical fixation for displaced fractures.',
        'MRI to assess ligamentous and meniscal injuries.',
        'Vascular assessment if high-energy mechanism.',
      ],
      urgency: 'urgent',
    },

    'Loose Bodies': {
      clinicalSignificance: 'Intra-articular osteochondral fragments causing mechanical symptoms including locking, clicking, and pain.',
      severityCriteria: {
        mild: 'Small calcified loose body without mechanical symptoms',
        moderate: 'Loose body causing intermittent joint locking',
        severe: 'Multiple loose bodies with recurrent locking episodes',
      },
      differentials: ['Synovial osteochondromatosis', 'Osteochondritis dissecans', 'Fracture fragment', 'Degenerative debris'],
      recommendations: [
        'Arthroscopic removal of symptomatic loose bodies.',
        'MRI to evaluate for underlying osteochondritis dissecans.',
        'CT for accurate localisation and number of calcified fragments.',
      ],
      urgency: 'non-urgent',
    },

    'Varus Deformity': {
      clinicalSignificance: 'Medial angulation of the mechanical axis increasing compressive load on the medial compartment.',
      severityCriteria: {
        mild: 'Varus angle <5°',
        moderate: '5–10° varus',
        severe: '>10° varus with significant medial compartment loading',
      },
      differentials: ['Primary varus knee', 'Post-traumatic deformity', 'Growth disturbance', 'Rickets'],
      recommendations: [
        'Full-length weight-bearing limb alignment X-ray for mechanical axis measurement.',
        'High tibial osteotomy for isolated medial compartment OA in younger patients.',
        'Total knee replacement for advanced OA.',
      ],
      urgency: 'non-urgent',
    },

    'Valgus Deformity': {
      clinicalSignificance: 'Lateral angulation of the mechanical axis increasing load on the lateral compartment.',
      severityCriteria: {
        mild: 'Valgus angle <5°',
        moderate: '5–10° valgus',
        severe: '>10° valgus deformity',
      },
      differentials: ['Primary valgus knee', 'Rheumatoid arthritis', 'Post-surgical deformity', 'Metabolic bone disease'],
      recommendations: [
        'Full-length limb alignment radiograph.',
        'Lateral distal femoral osteotomy or total knee replacement as clinically appropriate.',
      ],
      urgency: 'non-urgent',
    },

    'Patellar Malalignment': {
      clinicalSignificance: 'Lateral patellar displacement or tilt producing patellofemoral pain and instability.',
      severityCriteria: {
        mild: 'Mild lateral tilt without subluxation',
        moderate: 'Subluxation without dislocation',
        severe: 'Recurrent patellar dislocation',
      },
      differentials: ['Patellofemoral syndrome', 'Trochlear dysplasia', 'MPFL insufficiency', 'Vastus medialis dysfunction'],
      recommendations: [
        'Skyline / Merchant patellar radiograph for tilt and sulcus angle measurement.',
        'MRI for assessment of MPFL, trochlear morphology, and cartilage.',
        'Physiotherapy for VMO strengthening and patellar taping.',
        'MPFL reconstruction or tibial tubercle osteotomy for recurrent instability.',
      ],
      urgency: 'non-urgent',
    },

    'Calcification': {
      clinicalSignificance: 'Soft tissue, meniscal, or periarticular calcification that may indicate crystal deposition disease or tendinopathy.',
      severityCriteria: {
        mild: 'Incidental small calcification without joint involvement',
        moderate: 'Chondrocalcinosis affecting the meniscus or articular cartilage',
        severe: 'Extensive crystal deposition with secondary joint destruction',
      },
      differentials: ['CPPD (pseudogout)', 'Calcium hydroxyapatite deposition', 'Post-traumatic ossification', 'Synovial chondromatosis'],
      recommendations: [
        'Synovial fluid aspiration for crystal analysis during acute attack.',
        'Serum calcium, phosphate, magnesium, and PTH for metabolic workup.',
        'NSAIDs or colchicine for acute crystal arthropathy.',
      ],
      urgency: 'non-urgent',
    },

    'Effusion': {
      clinicalSignificance: 'Intra-articular fluid accumulation indicating joint inflammation, infection, haemarthrosis, or mechanical irritation.',
      severityCriteria: {
        mild: 'Small effusion detected on suprapatellar fluid sign',
        moderate: 'Moderate effusion with visible suprapatellar pouch distension',
        severe: 'Large tense effusion with restricted range of motion',
      },
      differentials: ['Inflammatory arthritis', 'Septic arthritis', 'Haemarthrosis', 'Gout / pseudogout', 'Post-traumatic'],
      recommendations: [
        'Joint aspiration for fluid analysis (cell count, culture, crystals) if infection or crystal disease suspected.',
        'URGENT if septic arthritis suspected — joint washout required.',
        'MRI if internal derangement is suspected.',
        'Inflammatory markers (ESR, CRP, WBC) and blood cultures as appropriate.',
      ],
      urgency: 'semi-urgent',
    },

    // ── Foot X-Ray Findings ──────────────────────────────────────────────────
    'Metatarsal Fracture': {
      clinicalSignificance: 'Fracture of one or more metatarsal bones — common in sporting injuries and falls.',
      severityCriteria: {
        mild: 'Non-displaced shaft fracture',
        moderate: 'Displaced or angulated fracture',
        severe: 'Multiple metatarsal fractures or Jones/pseudo-Jones fracture pattern',
      },
      differentials: ['Stress fracture', 'Lisfranc injury', 'Avulsion fracture'],
      recommendations: [
        'Buddy strapping and stiff-soled shoe for non-displaced fractures.',
        'Non-weight-bearing with short-leg cast for Jones fractures (5th metatarsal base).',
        'Open reduction and internal fixation for displaced or multiple fractures.',
        'CT if Lisfranc injury suspected.',
      ],
      urgency: 'semi-urgent',
    },

    'Lisfranc Injury': {
      clinicalSignificance: 'Ligamentous or bony injury at the tarsometatarsal joint complex — frequently missed, leads to chronic midfoot pain and deformity if untreated.',
      severityCriteria: {
        mild: 'Ligamentous injury without bony avulsion or malalignment on weight-bearing views',
        moderate: 'Diastasis >2 mm between 1st and 2nd metatarsal bases',
        severe: 'Complete tarsometatarsal disruption with dislocation',
      },
      differentials: ['Midfoot sprain', 'Isolated metatarsal fracture', 'Cuboid fracture'],
      recommendations: [
        'URGENT: Weight-bearing AP foot radiograph — diastasis is diagnostic.',
        'CT for surgical planning if operative management is planned.',
        'Non-operative management only for pure ligamentous injuries without instability.',
        'Open reduction and internal fixation for displaced Lisfranc injuries.',
      ],
      urgency: 'urgent',
    },

    'Hallux Valgus': {
      clinicalSignificance: 'Lateral angulation of the great toe at the first MTP joint with medial eminence prominence (bunion).',
      severityCriteria: {
        mild: 'HVA <20°, IMA <11°',
        moderate: 'HVA 20–40°, IMA 11–18°',
        severe: 'HVA >40°, IMA >18° with sesamoid subluxation',
      },
      differentials: ['Gout MTP arthritis', 'Rheumatoid forefoot deformity', 'Turf toe'],
      recommendations: [
        'Wide-toed footwear and orthotics for mild symptomatic cases.',
        'Surgical correction (osteotomy) for moderate-severe deformity causing functional limitation.',
        'Post-operative weight-bearing radiograph to confirm correction.',
      ],
      urgency: 'non-urgent',
    },

    'Stress Fracture': {
      clinicalSignificance: 'Fatigue or insufficiency fracture from repetitive loading, most common in the 2nd–3rd metatarsal shafts.',
      severityCriteria: {
        mild: 'Periosteal reaction without fracture line visible',
        moderate: 'Visible fracture line with periosteal callus',
        severe: 'Complete fracture with displacement',
      },
      differentials: ['Acute metatarsal fracture', 'Morton neuroma', 'Osteomyelitis', 'Metatarsalgia'],
      recommendations: [
        'MRI for early-stage stress fracture diagnosis if radiographs are normal.',
        'Activity modification and offloading boot for 6–8 weeks.',
        'Bone density assessment for recurrent or low-load insufficiency fractures.',
      ],
      urgency: 'non-urgent',
    },

    'Osteomyelitis': {
      clinicalSignificance: 'Bone infection producing cortical destruction, periosteal reaction, and systemic inflammatory response — particularly prevalent in diabetic foot.',
      severityCriteria: {
        mild: 'Early osteomyelitis with periosteal elevation',
        moderate: 'Cortical destruction with medullary involvement',
        severe: 'Diffuse osteomyelitis with sequestrum formation or pathological fracture',
      },
      differentials: ['Diabetic neuropathic arthropathy (Charcot)', 'Septic arthritis', 'Tumour', 'Stress fracture'],
      recommendations: [
        'MRI foot with contrast — most sensitive modality for osteomyelitis.',
        'Bone biopsy for culture and sensitivity.',
        'Prolonged intravenous antibiotics based on culture results.',
        'Surgical debridement or amputation for refractory cases.',
        'Diabetic foot clinic referral and vascular assessment.',
      ],
      urgency: 'urgent',
    },

    'Gout Arthropathy': {
      clinicalSignificance: 'Monosodium urate crystal deposition at the first MTP joint producing acute inflammatory arthritis and chronic juxta-articular erosions.',
      severityCriteria: {
        mild: 'Soft tissue swelling only, no bony erosion',
        moderate: 'Juxta-articular erosions with overhanging edges',
        severe: 'Large tophi with advanced erosive destruction',
      },
      differentials: ['Rheumatoid arthritis', 'Psoriatic arthritis', 'Septic arthritis', 'CPPD'],
      recommendations: [
        'Serum uric acid level measurement.',
        'Joint aspiration for crystal identification during acute attack.',
        'Acute management: NSAIDs, colchicine, or corticosteroids.',
        'Urate-lowering therapy (allopurinol/febuxostat) for recurrent gout.',
        'Dietary modification and hydration counselling.',
      ],
      urgency: 'semi-urgent',
    },

    'Pes Planus': {
      clinicalSignificance: 'Loss of the medial longitudinal arch producing flatfoot deformity, commonly associated with tibialis posterior tendon dysfunction.',
      severityCriteria: {
        mild: 'Flexible flatfoot — arch restored on toe-raise',
        moderate: 'Partial rigidity with hindfoot valgus',
        severe: 'Rigid flatfoot with talonavicular uncoverage and subtalar arthritis',
      },
      differentials: ['PTTD', 'Tarsal coalition', 'Neuropathic flatfoot (Charcot)', 'Ligamentous laxity'],
      recommendations: [
        'Weight-bearing lateral foot X-ray for talo-first metatarsal angle.',
        'Orthotics and physiotherapy for flexible flatfoot.',
        'Surgical reconstruction (osteotomy, tendon transfer) for rigid or progressive cases.',
      ],
      urgency: 'non-urgent',
    },

    'Plantar Spur': {
      clinicalSignificance: 'Bony enthesophyte at the plantar calcaneal tuberosity associated with plantar fasciitis.',
      severityCriteria: {
        mild: 'Small spur <5 mm without soft tissue changes',
        moderate: 'Moderate spur with plantar fascia thickening on ultrasound',
        severe: 'Large spur with chronic refractory plantar fasciitis',
      },
      differentials: ['Plantar fasciitis', 'Fat pad syndrome', 'Tarsal tunnel syndrome', 'Calcaneal stress fracture'],
      recommendations: [
        'Conservative management: stretching, orthotics, anti-inflammatories.',
        'Ultrasound-guided corticosteroid injection for refractory cases.',
        'Extracorporeal shock wave therapy (ESWT) as second-line.',
        'Surgical plantar fasciotomy as last resort.',
      ],
      urgency: 'non-urgent',
    },

    'Phalangeal Fracture': {
      clinicalSignificance: 'Fracture of one or more toe phalanges — commonly from crush injury or stubbing.',
      severityCriteria: {
        mild: 'Non-displaced phalangeal fracture',
        moderate: 'Displaced fracture requiring reduction',
        severe: 'Intra-articular fracture or open fracture',
      },
      differentials: ['Dislocation', 'Sesamoid fracture', 'Bone contusion'],
      recommendations: [
        'Buddy strapping for non-displaced fractures.',
        'Reduction under local anaesthetic for displaced fractures.',
        'Wound care and tetanus prophylaxis for open fractures.',
      ],
      urgency: 'non-urgent',
    },

    'Calcaneal Fracture': {
      clinicalSignificance: 'Fracture of the heel bone, most commonly from axial loading (fall from height). High risk of subtalar arthritis if intra-articular.',
      severityCriteria: {
        mild: 'Extra-articular avulsion or tongue-type fracture',
        moderate: 'Intra-articular Sanders Type II',
        severe: 'Comminuted intra-articular Sanders Type III–IV',
      },
      differentials: ['Calcaneal stress fracture', 'Plantar fascia avulsion', 'Subtalar dislocation'],
      recommendations: [
        'CT heel for intra-articular assessment (Sanders classification).',
        'Non-weight-bearing with surgical planning for intra-articular fractures.',
        'Open reduction and internal fixation vs. conservative management based on fracture pattern and patient factors.',
        'Compartment syndrome monitoring.',
      ],
      urgency: 'urgent',
    },

    'Sesamoid Fracture': {
      clinicalSignificance: 'Fracture of the hallux sesamoids (medial or lateral) — often mistaken for a bipartite sesamoid.',
      severityCriteria: {
        mild: 'Non-displaced sesamoid fracture',
        moderate: 'Displaced fracture with metatarsalgia',
        severe: 'Avascular necrosis of the sesamoid',
      },
      differentials: ['Bipartite sesamoid (normal variant)', 'Sesamoiditis', 'Stress fracture'],
      recommendations: [
        'Comparison views of contralateral foot to exclude bipartite sesamoid.',
        'MRI for stress fracture or avascular necrosis diagnosis.',
        'Offloading orthotics and activity modification.',
        'Sesamoidectomy for refractory cases.',
      ],
      urgency: 'non-urgent',
    },

    'Pes Cavus': {
      clinicalSignificance: 'High-arched foot deformity associated with neurological conditions including Charcot-Marie-Tooth disease.',
      severityCriteria: {
        mild: 'Mild elevation of the arch without deformity',
        moderate: 'Claw toes and callosities with moderate arch elevation',
        severe: 'Rigid cavus with ankle instability and neuropathic complications',
      },
      differentials: ['Charcot-Marie-Tooth disease', 'Friedreich ataxia', 'Spastic cerebral palsy', 'Polio sequelae'],
      recommendations: [
        'Neurological assessment to identify underlying cause.',
        'EMG/nerve conduction studies.',
        'Orthotics for pressure distribution.',
        'Surgical correction (osteotomy, soft tissue procedures) for rigid symptomatic deformity.',
      ],
      urgency: 'non-urgent',
    },

    'Femoral Condyle Fracture': {
      clinicalSignificance: 'Fracture involving the distal femoral condyle, often from high-energy trauma or stress in osteoporotic bone.',
      severityCriteria: {
        mild: 'Non-displaced or minimally displaced condylar fracture',
        moderate: 'Displaced intra-articular fracture',
        severe: 'Comminuted supracondylar/intercondylar fracture (AO/OTA Type C)',
      },
      differentials: ['Tibial plateau fracture', 'Patellar fracture', 'Pathological fracture'],
      recommendations: [
        'CT for fracture characterisation and surgical planning.',
        'Open reduction and internal fixation for displaced fractures.',
        'Vascular assessment given proximity to popliteal vessels.',
        'Orthopaedic emergency referral for neurovascular compromise.',
      ],
      urgency: 'urgent',
    },

    'Patella Fracture': {
      clinicalSignificance: 'Patellar fracture disrupts the extensor mechanism — active knee extension may be lost.',
      severityCriteria: {
        mild: 'Non-displaced transverse fracture with intact extensor mechanism',
        moderate: 'Displaced transverse fracture',
        severe: 'Comminuted or stellate fracture requiring patellectomy consideration',
      },
      differentials: ['Bipartite patella', 'Sleeve fracture (paediatric)', 'Osteochondral fracture'],
      recommendations: [
        'Assessment of extensor mechanism integrity — inability to straight-leg raise indicates surgical indication.',
        'Tension band wiring or ORIF for displaced fractures.',
        'Cylinder cast for non-displaced fractures with intact extensor mechanism.',
      ],
      urgency: 'urgent',
    },

    // ── Abdominal Ultrasound Findings ────────────────────────────────────────
    'Cholelithiasis': {
      clinicalSignificance: 'Gallstones within the gallbladder — may be asymptomatic or cause biliary colic, cholecystitis, or choledocholithiasis.',
      severityCriteria: {
        mild: 'Incidental cholelithiasis without symptoms',
        moderate: 'Symptomatic biliary colic with multiple calculi',
        severe: 'Impacted stone causing acute cholecystitis or Mirizzi syndrome',
      },
      differentials: ['Gallbladder polyp', 'Adenomyomatosis', 'Sludge (pseudo-stone)'],
      recommendations: [
        'Low-fat diet and analgesia for symptomatic cholelithiasis.',
        'Laparoscopic cholecystectomy for symptomatic gallstones.',
        'MRCP if common bile duct stones suspected.',
      ],
      urgency: 'non-urgent',
    },

    'Acute Cholecystitis': {
      clinicalSignificance: 'Acute inflammation of the gallbladder, most commonly due to cystic duct obstruction by a calculus.',
      severityCriteria: {
        mild: 'Uncomplicated acute cholecystitis',
        moderate: 'Cholecystitis with pericholecystic abscess or empyema',
        severe: 'Gangrenous or perforated cholecystitis',
      },
      differentials: ['Biliary colic', 'Acalculous cholecystitis', 'Peptic ulcer disease', 'Hepatitis'],
      recommendations: [
        'URGENT: IV antibiotics, analgesia, and nil by mouth.',
        'Surgical review — early laparoscopic cholecystectomy within 72 hours is preferred.',
        'Percutaneous cholecystostomy if patient is unfit for surgery.',
        'Serial WBC, LFTs, and clinical monitoring for deterioration.',
      ],
      urgency: 'urgent',
    },

    'Choledocholithiasis': {
      clinicalSignificance: 'Stone in the common bile duct causing biliary obstruction, jaundice, cholangitis, or pancreatitis.',
      severityCriteria: {
        mild: 'CBD dilatation with suspected stone — no cholangitis',
        moderate: 'Confirmed CBD stone with jaundice',
        severe: 'Ascending cholangitis (Charcot triad: fever, jaundice, RUQ pain)',
      },
      differentials: ['Biliary stricture', 'Cholangiocarcinoma', 'Primary sclerosing cholangitis'],
      recommendations: [
        'URGENT if cholangitis suspected — IV antibiotics and emergency ERCP.',
        'MRCP for confirmation of CBD stone.',
        'ERCP with sphincterotomy and stone extraction.',
        'LFTs, bilirubin, and ALP monitoring.',
      ],
      urgency: 'urgent',
    },

    'Hepatomegaly': {
      clinicalSignificance: 'Enlarged liver beyond 15 cm span in the mid-clavicular line, indicating underlying parenchymal, vascular, or infiltrative disease.',
      severityCriteria: {
        mild: 'Mildly enlarged 15–17 cm span',
        moderate: '17–20 cm span with parenchymal changes',
        severe: '>20 cm span or massive hepatomegaly',
      },
      differentials: ['Fatty liver disease (NAFLD)', 'Viral hepatitis', 'Congestive hepatopathy', 'Lymphoma', 'Haematological malignancy'],
      recommendations: [
        'LFTs, viral hepatitis serology, ferritin, and autoimmune panel.',
        'CT abdomen with contrast if focal lesion or malignancy suspected.',
        'Liver biopsy for unexplained parenchymal disease.',
        'Hepatology referral.',
      ],
      urgency: 'semi-urgent',
    },

    'Hepatic Steatosis': {
      clinicalSignificance: 'Hepatic fat deposition producing increased echogenicity — spectrum from simple steatosis to NASH and cirrhosis.',
      severityCriteria: {
        mild: 'Grade I: mild increase in liver echogenicity',
        moderate: 'Grade II: moderate echogenicity with partial loss of portal vein wall definition',
        severe: 'Grade III: marked echogenicity with complete loss of diaphragm and vessel definition',
      },
      differentials: ['NAFLD/NASH', 'Alcoholic steatosis', 'Drug-induced', 'Wilson disease'],
      recommendations: [
        'Liver function tests, GGT, and metabolic panel.',
        'FibroScan (elastography) for fibrosis staging.',
        'Dietary modification, weight loss, and exercise programme.',
        'Hepatology referral for advanced fibrosis or cirrhosis.',
      ],
      urgency: 'non-urgent',
    },

    'Hepatic Lesion': {
      clinicalSignificance: 'Focal hepatic abnormality — requires characterisation to differentiate benign (cyst, haemangioma) from malignant (HCC, metastasis) lesions.',
      severityCriteria: {
        mild: 'Simple cyst or haemangioma with typical benign features',
        moderate: 'Indeterminate lesion requiring further imaging',
        severe: 'Lesion with malignant features or in a cirrhotic liver (HCC risk)',
      },
      differentials: ['Simple hepatic cyst', 'Haemangioma', 'Hepatocellular carcinoma', 'Metastasis', 'FNH', 'Hepatic adenoma'],
      recommendations: [
        'URGENT: MRI liver with hepatobiliary agent (Primovist) for characterisation.',
        'AFP level if HCC suspected.',
        'Multidisciplinary liver meeting discussion.',
        'CT-guided or surgical biopsy if diagnosis remains uncertain.',
      ],
      urgency: 'urgent',
    },

    'Renal Calculus': {
      clinicalSignificance: 'Kidney stone within the renal collecting system — may pass spontaneously or cause obstructive uropathy.',
      severityCriteria: {
        mild: 'Stone <4 mm — likely to pass spontaneously',
        moderate: 'Stone 4–10 mm — may require intervention',
        severe: 'Stone >10 mm or causing significant hydronephrosis — intervention indicated',
      },
      differentials: ['Nephrocalcinosis', 'Renal artery calcification', 'Papillary necrosis calcification'],
      recommendations: [
        'CT KUB (non-contrast) for stone size, location, and density.',
        'Analgesia and alpha-blocker (tamsulosin) for medical expulsive therapy.',
        'Urology referral for stones >10 mm or persistent obstruction.',
        'Metabolic workup (calcium, uric acid, oxalate) for recurrent stones.',
      ],
      urgency: 'semi-urgent',
    },

    'Hydronephrosis': {
      clinicalSignificance: 'Dilatation of the renal pelvis and calyces from urinary outflow obstruction.',
      severityCriteria: {
        mild: 'Grade I–II: mild pelvic dilatation without calyceal involvement',
        moderate: 'Grade III: pelvicalyceal dilatation with cortical thinning beginning',
        severe: 'Grade IV: marked thinning of renal cortex with global calyceal dilatation',
      },
      differentials: ['Ureteric calculus', 'PUJ obstruction', 'Extrinsic compression', 'Urothelial tumour', 'Retroperitoneal fibrosis'],
      recommendations: [
        'CT KUB to identify the level and cause of obstruction.',
        'URGENT if infected hydronephrosis (pyonephrosis) suspected — percutaneous nephrostomy.',
        'Urology referral for planning of definitive obstruction relief.',
        'Renal function monitoring (creatinine, eGFR).',
      ],
      urgency: 'semi-urgent',
    },

    'Renal Cyst': {
      clinicalSignificance: 'Fluid-filled renal lesion — simple cysts are benign; complex cysts require Bosniak classification.',
      severityCriteria: {
        mild: 'Bosniak I–II: simple or minimally complex cyst (benign)',
        moderate: 'Bosniak IIF: minimally complex with short-interval follow-up',
        severe: 'Bosniak III–IV: complex cyst with possible malignancy',
      },
      differentials: ['Simple cyst', 'Multilocular cystic nephroma', 'Cystic renal cell carcinoma', 'Abscess', 'Haematoma'],
      recommendations: [
        'MRI for Bosniak IIF–IV lesions.',
        'Urology referral for Bosniak III–IV cysts.',
        'No follow-up needed for Bosniak I–II cysts.',
      ],
      urgency: 'non-urgent',
    },

    'Splenomegaly': {
      clinicalSignificance: 'Enlarged spleen beyond 12 cm craniocaudal span — reflects systemic disease process.',
      severityCriteria: {
        mild: 'Mild splenomegaly 12–15 cm',
        moderate: 'Moderate 15–20 cm',
        severe: 'Massive splenomegaly >20 cm',
      },
      differentials: ['Portal hypertension (cirrhosis)', 'Haematological malignancy', 'Infectious mononucleosis', 'Haemolytic anaemia', 'Storage disorders'],
      recommendations: [
        'Full blood count with differential.',
        'Liver function tests and portal hypertension assessment.',
        'EBV/CMV serology if infectious cause suspected.',
        'Haematology referral for haematological malignancy workup.',
      ],
      urgency: 'semi-urgent',
    },

    'Ascites': {
      clinicalSignificance: 'Free peritoneal fluid accumulation indicating serious underlying pathology.',
      severityCriteria: {
        mild: 'Small perihepatic or pelvic fluid',
        moderate: 'Moderate ascites with flank bulging',
        severe: 'Tense ascites with respiratory compromise',
      },
      differentials: ['Cirrhosis', 'Malignant ascites', 'Cardiac failure', 'Nephrotic syndrome', 'Peritoneal tuberculosis'],
      recommendations: [
        'Diagnostic paracentesis — ascitic fluid protein, albumin (SAAG), WBC, culture, cytology.',
        'SAAG ≥1.1 g/dL suggests portal hypertension aetiology.',
        'Gastroenterology/hepatology referral.',
        'Therapeutic paracentesis for symptomatic relief of tense ascites.',
      ],
      urgency: 'semi-urgent',
    },

    'Bladder Calculus': {
      clinicalSignificance: 'Stone within the urinary bladder causing lower urinary tract symptoms, haematuria, or recurrent UTIs.',
      severityCriteria: {
        mild: 'Small stone <1 cm',
        moderate: '1–3 cm stone',
        severe: 'Large stone >3 cm or multiple calculi',
      },
      differentials: ['Bladder tumour', 'Foreign body', 'Blood clot'],
      recommendations: [
        'Cystoscopy for visual inspection and to exclude bladder tumour.',
        'Litholapaxy or cystolithotomy for stone removal.',
        'Urine culture and antibiotic treatment for associated UTI.',
        'Assessment for urinary outflow obstruction (BPH, urethral stricture).',
      ],
      urgency: 'non-urgent',
    },

    'Bladder Wall Thickening': {
      clinicalSignificance: 'Focal or diffuse thickening of the bladder wall — may indicate cystitis, outlet obstruction, or malignancy.',
      severityCriteria: {
        mild: 'Diffuse uniform thickening consistent with underfilled bladder or cystitis',
        moderate: 'Irregular thickening >5 mm in a well-distended bladder',
        severe: 'Focal mass lesion or intraluminal extension',
      },
      differentials: ['Chronic cystitis', 'Bladder carcinoma (TCC)', 'Neurogenic bladder', 'BPH-related hypertrophy'],
      recommendations: [
        'Urine cytology and microscopy.',
        'CT urography for upper tract and bladder assessment.',
        'Cystoscopy if bladder malignancy is suspected.',
        'Urological referral.',
      ],
      urgency: 'semi-urgent',
    },

    'Pancreatic Pathology': {
      clinicalSignificance: 'Pancreatic abnormality including pancreatitis, pancreatic duct dilatation, or focal lesion — requires further characterisation.',
      severityCriteria: {
        mild: 'Mildly oedematous pancreas without necrosis',
        moderate: 'Pancreatic duct dilatation or indeterminate focal lesion',
        severe: 'Necrotic pancreatitis, pseudocyst, or pancreatic mass',
      },
      differentials: ['Acute pancreatitis', 'Chronic pancreatitis', 'Pancreatic adenocarcinoma', 'IPMN', 'Pancreatic cyst'],
      recommendations: [
        'Serum amylase, lipase, and LFTs.',
        'CT abdomen with pancreatic protocol for further characterisation.',
        'MRCP if ductal pathology or cystic lesion is present.',
        'Urgent gastroenterology/surgical referral for pancreatic mass.',
        'Avoid oral intake and provide IV fluids for acute pancreatitis.',
      ],
      urgency: 'urgent',
    },

    // ── Breast Ultrasound Findings (BI-RADS) ─────────────────────────────────
    'No Finding (BI-RADS 1)': {
      clinicalSignificance: 'Negative study. No sonographic abnormality. Routine screening interval is appropriate.',
      severityCriteria: {
        normal: 'BI-RADS 1 — negative study',
      },
      differentials: [],
      recommendations: [
        'Routine clinical breast examination and mammographic screening as per age-appropriate guidelines.',
      ],
      urgency: 'routine',
    },

    'Simple Cyst (BI-RADS 2)': {
      clinicalSignificance: 'Entirely benign simple cyst — BI-RADS 2. No malignancy risk.',
      severityCriteria: {
        mild: 'Small simple cyst (<1 cm)',
        moderate: 'Multiple simple cysts',
        normal: 'Incidental anechoic cyst with posterior enhancement',
      },
      differentials: ['Complex cyst', 'Galactocele', 'Haematoma'],
      recommendations: [
        'No follow-up required for simple cysts.',
        'Aspiration for symptomatic cysts causing discomfort.',
      ],
      urgency: 'routine',
    },

    'Fibroadenoma (BI-RADS 3)': {
      clinicalSignificance: 'Probably benign — BI-RADS 3. Malignancy risk <2%. Short-interval follow-up recommended.',
      severityCriteria: {
        mild: 'Small fibroadenoma <1 cm with classic features',
        moderate: 'Fibroadenoma 1–3 cm or atypical features',
        normal: 'Classic oval, parallel, hypoechoic mass',
      },
      differentials: ['Phyllodes tumour', 'Lactating adenoma', 'Papillary lesion', 'Low-grade malignancy'],
      recommendations: [
        'Short-interval follow-up ultrasound in 6 months.',
        'Core needle biopsy for lesions with atypical features or patient preference.',
        'Surgical excision if rapid growth or size >3 cm.',
      ],
      urgency: 'non-urgent',
    },

    'Complex Cyst (BI-RADS 3)': {
      clinicalSignificance: 'Probably benign complex cystic lesion — BI-RADS 3. Short-interval follow-up required.',
      severityCriteria: {
        mild: 'Thin internal septation only',
        moderate: 'Thick wall or intracystic nodule',
        normal: 'Mixed cystic-solid lesion',
      },
      differentials: ['Intracystic papilloma', 'Abscess', 'Haematoma', 'Galactocele', 'Low-grade malignancy'],
      recommendations: [
        'Short-interval follow-up ultrasound in 6 months.',
        'Biopsy for thick-walled or intracystic nodule components.',
      ],
      urgency: 'non-urgent',
    },

    'Solid Hypoechoic Nodule (BI-RADS 4A)': {
      clinicalSignificance: 'Low suspicious for malignancy — BI-RADS 4A. Cancer probability 2–10%. Tissue sampling recommended.',
      severityCriteria: {
        mild: 'Oval, mildly hypoechoic with smooth margins',
        moderate: 'Hypoechoic with minimal irregularity',
        normal: 'Solid mass with low-suspicion features',
      },
      differentials: ['Fibroadenoma', 'Papilloma', 'Fibrocystic change', 'Low-grade carcinoma'],
      recommendations: [
        'Ultrasound-guided core needle biopsy.',
        'Histological correlation essential.',
        'Multidisciplinary breast team discussion of biopsy result.',
      ],
      urgency: 'semi-urgent',
    },

    'Irregular Hypoechoic Mass (BI-RADS 4B)': {
      clinicalSignificance: 'Intermediate suspicion for malignancy — BI-RADS 4B. Cancer probability 10–50%.',
      severityCriteria: {
        mild: 'Irregular margin with microlobulations',
        moderate: 'Angular margins with posterior shadowing',
        severe: 'Taller-than-wide orientation with posterior shadowing',
      },
      differentials: ['Invasive ductal carcinoma', 'Invasive lobular carcinoma', 'Fibroadenoma with atypical features', 'Radial scar'],
      recommendations: [
        'URGENT: Ultrasound-guided core needle biopsy.',
        'MRI breast for extent of disease if carcinoma confirmed.',
        'Sentinel lymph node biopsy planning.',
        'Urgent multidisciplinary breast oncology referral.',
      ],
      urgency: 'urgent',
    },

    'Suspicious Malignant Features (BI-RADS 4C)': {
      clinicalSignificance: 'High suspicion for malignancy — BI-RADS 4C. Cancer probability >50%.',
      severityCriteria: {
        severe: 'Spiculated mass, marked posterior shadowing, or duct extension',
        moderate: 'Marked angular margins with surrounding architectural distortion',
        mild: 'Multiple suspicious features without clear spiculation',
      },
      differentials: ['Invasive ductal carcinoma NOS', 'Invasive lobular carcinoma', 'Triple-negative breast cancer'],
      recommendations: [
        'URGENT: Biopsy and multidisciplinary breast oncology team referral.',
        'MRI breast for surgical planning.',
        'Axillary lymph node assessment.',
        'Do not delay biopsy — awaiting further imaging is not appropriate.',
      ],
      urgency: 'urgent',
    },

    'Highly Suspicious for Malignancy (BI-RADS 5)': {
      clinicalSignificance: 'CRITICAL: Highly suspicious for malignancy — BI-RADS 5. Cancer probability ≥95%.',
      severityCriteria: {
        severe: 'Classic malignant features: spiculated, taller-than-wide, architectural distortion, microcalcification',
      },
      differentials: ['Invasive carcinoma', 'Inflammatory carcinoma', 'Metastatic deposit'],
      recommendations: [
        'IMMEDIATE: Core needle biopsy under ultrasound guidance.',
        'Urgent multidisciplinary breast oncology team referral.',
        'MRI for surgical staging and assessment of contralateral breast.',
        'Axillary staging with sentinel node biopsy or axillary clearance.',
      ],
      urgency: 'critical',
    },

    'Ductal Ectasia': {
      clinicalSignificance: 'Dilatation of the subareolar milk ducts, commonly an incidental finding in perimenopausal women.',
      severityCriteria: {
        mild: 'Mild duct dilatation <3 mm',
        moderate: '3–5 mm ductectasia with possible nipple discharge',
        severe: 'Significant ectasia with intraluminal debris or bloody discharge',
      },
      differentials: ['Intraductal papilloma', 'DCIS', 'Duct infection (periductal mastitis)'],
      recommendations: [
        'Mammographic correlation.',
        'Nipple discharge cytology if present.',
        'Microdochectomy for bloody or persistent discharge.',
      ],
      urgency: 'non-urgent',
    },

    'Lymph Node (Axillary)': {
      clinicalSignificance: 'Normal-appearing axillary lymph node with preserved fatty hilum — no pathological adenopathy.',
      severityCriteria: {
        normal: 'Kidney-shaped node with fatty hilum and cortex <3 mm',
      },
      differentials: ['Reactive lymphadenopathy', 'Breast carcinoma metastasis', 'Lymphoma'],
      recommendations: [
        'No immediate intervention required for normal-appearing nodes.',
        'Clinical correlation with breast findings.',
      ],
      urgency: 'routine',
    },

    'Suspicious Lymph Node': {
      clinicalSignificance: 'Abnormal axillary lymph node morphology suggesting pathological adenopathy — malignancy must be excluded.',
      severityCriteria: {
        mild: 'Cortical thickening 3–5 mm with preserved hilum',
        moderate: 'Eccentric cortical thickening or partial hilum loss',
        severe: 'Rounded node with absent hilum — high suspicion for metastasis',
      },
      differentials: ['Breast carcinoma nodal metastasis', 'Lymphoma', 'Reactive adenopathy', 'Melanoma metastasis'],
      recommendations: [
        'Ultrasound-guided fine needle aspiration or core biopsy of suspicious node.',
        'Sentinel lymph node biopsy if primary breast malignancy is confirmed.',
        'PET-CT for staging if lymphoma is suspected.',
      ],
      urgency: 'urgent',
    },

    'Skin Thickening': {
      clinicalSignificance: 'Breast skin thickening >2 mm — may indicate inflammatory carcinoma, lymphoedema, or dermal involvement.',
      severityCriteria: {
        mild: 'Focal skin thickening 2–3 mm',
        moderate: 'Diffuse skin thickening >3 mm',
        severe: 'Peau d\'orange appearance with erythema — suspect inflammatory breast cancer',
      },
      differentials: ['Inflammatory breast carcinoma', 'Lymphoedema', 'Mastitis', 'Radiation change'],
      recommendations: [
        'URGENT: Clinical examination for erythema, warmth, and peau d\'orange.',
        'Skin punch biopsy if inflammatory carcinoma suspected.',
        'Mammogram and breast MRI.',
        'Urgent oncology referral.',
      ],
      urgency: 'urgent',
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
