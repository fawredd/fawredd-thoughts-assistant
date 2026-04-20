# Risk Registry - Fawredd Thoughts Assistant

| Risk | Probability | Impact | Mitigation | Owner |
|------|------------|--------|-----------|-------|
| Spec ambiguity (unclear AC) | HIGH | Task rework | [CLARIFY] tag + ReqDoc update | Spec Agent |
| External API timeout (OpenRouter) | MEDIUM | Feature failure | Timeout + retry + error handling | Dev Agent |
| Clerk Auth configuration complexity | LOW | Delay in setup | Follow official Next.js integration guide | Dev Agent |
| Token explosion in snapshot | LOW | Increased costs/latency | Strict schema enforcement and pruning logic | Spec Agent |
| Encryption Key Loss/Change | LOW | Permanent Data Loss | Secure key management and backup | PM Agent |
| Mixed Data Formats (JSON vs Encrypted) | MEDIUM | UI Crashes | Defensive checks in decryption utility (implemented) | Dev Agent |
