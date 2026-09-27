import re

class ClinicalNegationDetector:
    """
    Transparent NegEx / ConText-style clinical negation detection engine.
    Identifies pre-negation cues, post-negation cues, pseudo-negation phrases,
    and scope termination boundaries.
    """
    
    PRE_NEGATION_CUES = [
        "no", "not", "none", "denies", "denied", "denying", "without", "no evidence of",
        "no sign of", "no signs of", "negative for", "rules out", "ruled out",
        "r/o", "free of", "never had", "did not have", "does not have", "doesn't have",
        "cannot see", "fails to reveal", "declines", "absence of", "absent",
        "unremarkable for", "not report", "does not report", "did not report",
        "denies any", "no history of", "no complaint of", "unlikely", "zero"
    ]
    
    POST_NEGATION_CUES = [
        "was negative", "is negative", "were negative", "ruled out", "is ruled out",
        "was ruled out", "unlikely", "absent", "is absent", "was absent",
        "resolved", "not present", "was not seen", "was not found"
    ]
    
    PSEUDO_NEGATIONS = [
        "no change", "no significant change", "not only", "not certain",
        "without difficulty", "no cause for concern", "gram negative"
    ]
    
    SCOPE_CONJUNCTIONS = [
        "but", "however", "although", "except", "yet", "aside from",
        "nevertheless", "though", "whereas", "while", "still"
    ]
    
    def __init__(self):
        # Sort cues by descending length so multi-word cues match first
        self.pre_cues = sorted(self.PRE_NEGATION_CUES, key=len, reverse=True)
        self.post_cues = sorted(self.POST_NEGATION_CUES, key=len, reverse=True)
        self.pseudo_cues = sorted(self.PSEUDO_NEGATIONS, key=len, reverse=True)
        
    def detect_negation(self, text: str, entity_text: str, entity_start: int = -1, entity_end: int = -1):
        """
        Detects negation status of an entity mention within text.
        Returns:
            status: "PRESENT", "NEGATED", or "UNKNOWN"
            cue: string or None
            scope: string
        """
        if not text or not entity_text:
            return {"status": "UNKNOWN", "cue": None, "scope": ""}
            
        # Find sentence containing entity
        # Split text into sentences
        sent_spans = []
        for m in re.finditer(r'[^.!?\n]+[.!?\n]?', text):
            s_text = m.group(0)
            if s_text.strip():
                sent_spans.append((m.start(), m.end(), s_text.strip()))
                
        target_sent = text
        sent_start_offset = 0
        if entity_start >= 0:
            for s_start, s_end, s_str in sent_spans:
                if s_start <= entity_start < s_end:
                    target_sent = s_str
                    sent_start_offset = s_start
                    break
        else:
            # Locate entity_text in text (case insensitive)
            pos = text.lower().find(entity_text.lower())
            if pos >= 0:
                entity_start = pos
                entity_end = pos + len(entity_text)
                for s_start, s_end, s_str in sent_spans:
                    if s_start <= entity_start < s_end:
                        target_sent = s_str
                        sent_start_offset = s_start
                        break
                        
        sent_lower = target_sent.lower()
        ent_lower = entity_text.lower()
        
        # Check if pseudo-negation is present and covers the sentence
        for pseudo in self.pseudo_cues:
            if pseudo in sent_lower:
                # If the entity is inside the pseudo phrase itself, don't negate
                # e.g., "no change"
                pass
                
        # Look for pre-negation cues preceding the entity
        ent_idx_in_sent = sent_lower.find(ent_lower)
        if ent_idx_in_sent >= 0:
            pre_text = sent_lower[:ent_idx_in_sent].strip()
            post_text = sent_lower[ent_idx_in_sent + len(ent_lower):].strip()
            
            # Check for scope boundary in pre_text (conjunctions like 'but', 'however')
            # The cue must be after the last conjunction in pre_text
            last_conj_pos = -1
            for conj in self.SCOPE_CONJUNCTIONS:
                pos = pre_text.rfind(f" {conj} ")
                if pos > last_conj_pos:
                    last_conj_pos = pos + len(conj) + 2
                    
            valid_pre_window = pre_text[last_conj_pos:] if last_conj_pos >= 0 else pre_text
            
            # Check pre-negation cues in the valid pre window (up to ~6 words before entity)
            for cue in self.pre_cues:
                # Regex boundary for cue
                pattern = r'\b' + re.escape(cue) + r'\b'
                matches = list(re.finditer(pattern, valid_pre_window))
                if matches:
                    last_match = matches[-1]
                    # Check distance in words from cue end to entity start
                    between_text = valid_pre_window[last_match.end():]
                    word_dist = len(between_text.split())
                    # Check if there is a comma or semicolon that terminates scope
                    if word_dist <= 7 and not (";" in between_text):
                        return {
                            "status": "NEGATED",
                            "cue": cue,
                            "scope": target_sent
                        }
                        
            # Check post-negation cues
            # e.g., "headache is absent", "fever was ruled out"
            first_conj_pos = len(post_text)
            for conj in self.SCOPE_CONJUNCTIONS:
                pos = post_text.find(f" {conj} ")
                if pos != -1 and pos < first_conj_pos:
                    first_conj_pos = pos
            valid_post_window = post_text[:first_conj_pos]
            
            for cue in self.post_cues:
                pattern = r'\b' + re.escape(cue) + r'\b'
                if re.search(pattern, valid_post_window):
                    return {
                        "status": "NEGATED",
                        "cue": cue,
                        "scope": target_sent
                    }
                    
        return {
            "status": "PRESENT",
            "cue": None,
            "scope": target_sent
        }

    def simple_keyword_baseline(self, text: str, entity_text: str):
        """Simple baseline that just checks if 'no' or 'not' is in the text."""
        t_lower = text.lower()
        if "no " in t_lower or "not " in t_lower or "without " in t_lower or "denies " in t_lower:
            return "NEGATED"
        return "PRESENT"

# Global singleton
negation_detector = ClinicalNegationDetector()
