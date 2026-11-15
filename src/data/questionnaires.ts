import { questionnaireV1 } from "./questionnaire.v1";

/**
 * Toutes les versions du questionnaire, y compris les anciennes : un lien partagé
 * reste lisible quand le questionnaire évolue [F-26].
 */
export const QUESTIONNAIRES = [questionnaireV1] as const;

export type VersionedQuestionnaire = (typeof QUESTIONNAIRES)[number];
export type VersionId = VersionedQuestionnaire["version"];

/** Version proposée aux nouveaux candidats. */
export const CURRENT_QUESTIONNAIRE = questionnaireV1;

/**
 * Empreintes des versions publiées. Une version publiée ne doit plus changer : un test
 * le vérifie [S-04]. On y ajoute v1 au lancement de la V1 ; avant, v1 reste un brouillon.
 */
export const PUBLISHED_FINGERPRINTS: Partial<Record<VersionId, string>> = {};
