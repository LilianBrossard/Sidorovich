import { SCALE_FACTORS } from "@/lib/quiz/domain";
import { fingerprint } from "@/lib/quiz/fingerprint";
import { DEFAULT_CALIBRATION } from "@/lib/quiz/simulation";
import type { CalibrationParams, Questionnaire } from "@/lib/quiz/types";
import { FACTIONS } from "./factions";

export const CALIBRATION_PARAMS: CalibrationParams = DEFAULT_CALIBRATION;

/**
 * Empreinte de tout ce dont dépendent les centres calibrés. Si elle diffère de celle
 * enregistrée dans centers.{version}.json, il faut relancer `npm run calibrate`.
 */
export const calibrationFingerprint = (questionnaire: Questionnaire): string =>
  fingerprint({
    questionnaire,
    factions: FACTIONS,
    params: CALIBRATION_PARAMS,
    scaleFactors: SCALE_FACTORS,
  });
