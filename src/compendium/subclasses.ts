// GERADO POR scripts/build-compendium.ts — NÃO EDITAR À MÃO.
// Fonte: specs/dh-sw.html
import type { Subclass } from "@/types"

export const SUBCLASSES: readonly Subclass[] = [
  {
    "name": "Augur",
    "className": "Adept",
    "spellcastTrait": "Knowledge",
    "foundation": [
      {
        "name": "Force Guidance",
        "text": "You have Advantage on all **Knowledge Rolls** to recall information. If this is about some Force related subject, such as Force Tradition, creature, etc, gain a **Hope** even on a roll with **Fear**."
      },
      {
        "name": "Preparation",
        "text": "You can mark a **Stress** instead of spending a **Hope** to use an *Experience* on a roll. If you do, double the *Experience* modifier for that roll."
      }
    ],
    "specialization": [
      {
        "name": "Experience Shift",
        "text": "When you take this Specialization, you may change an existing **Experience** you have, then add **+1** to one of your **Experiences**."
      },
      {
        "name": "Adaptable Memory",
        "text": "Once per short rest, when recalling a Domain card from your Vault, you can reduce its Recall Cost by **1**."
      }
    ],
    "mastery": [
      {
        "name": "Enhanced Experiences",
        "text": "When you take this Mastery, choose 2 **Experiences** to add **+1** on each of them."
      },
      {
        "name": "Natural Experience",
        "text": "Whenever you wish to use an **Experience**, roll as much **D6** as half your **Proficiency** (Rounded up). On any result of **5+**, you don’t spend a **Hope** to use the **Experience**."
      }
    ]
  },
  {
    "name": "Warden",
    "className": "Adept",
    "spellcastTrait": "Knowledge",
    "foundation": [
      {
        "name": "Guard Stance",
        "text": "Quando você ou um aliado dentro do alcance *Very Close* for alvo de um ataque, marque um **Stress**. Se o alvo era o aliado, você se coloca na frente e passa a ser o alvo. Role **1D8** e some o resultado à sua **Evasion** contra esse ataque."
      },
      {
        "name": "Hopeful Strike",
        "text": "When you succeed on an Attack Roll with **Hope**, you can choose to deal an extra **1D10** Damage instead of taking the **Hope**."
      }
    ],
    "specialization": [
      {
        "name": "Force Protection",
        "text": "While you have at least **2 Hope**, you add your **Proficiency** to your **Evasion**."
      },
      {
        "name": "Force Riposte",
        "text": "Quando um ataque erra por causa da sua **Guard Stance**, gaste uma **Hope** para devolvê-lo: se era um ataque à distância, o agressor sofre o dano da própria arma; se era corpo a corpo, faça imediatamente um ataque contra ele."
      }
    ],
    "mastery": [
      {
        "name": "Defensive Shell",
        "text": "O dado da sua **Guard Stance** passa a ser **1D12**. Além disso, quando um ataque erra por causa dela, escolha uma: gaste uma **Hope** para devolver o ataque como na *Force Riposte*, ou limpe o **Stress** que você marcou para usá-la."
      },
      {
        "name": "Fateful Hope",
        "text": "Your extra damage from **Hopeful Strike** becomes **3D10**. Additionally, it also makes the target mark a **Stress**."
      }
    ]
  },
  {
    "name": "Infiltrator",
    "className": "Agent",
    "spellcastTrait": "",
    "foundation": [
      {
        "name": "Infiltration Steps",
        "text": "While obscured by shadows or inside any visual blocking field, you can mark a **Stress** to move within *Close range* while still remaining Hidden."
      },
      {
        "name": "Behind Lines Aid",
        "text": "Use an action to spend **3 Hope** to clear **1D4 Hit Points** on a creature you are touching, including yourself."
      }
    ],
    "specialization": [
      {
        "name": "Adrenaline",
        "text": "When you are *Vulnerable*, you always add your **Level** to your **Damage roll** total."
      },
      {
        "name": "Improvised Repair",
        "text": "A number of times equal half your **Proficiency** (Rounded up) by *Rest*, you can spend a **Hope** to clear a number of **Armor Slots** equal to your **Knowledge** for you or an ally in your *Very Close* range."
      }
    ],
    "mastery": [
      {
        "name": "Flank Exploit",
        "text": "Your Flank Attack Die becomes **D10**."
      },
      {
        "name": "Induced Hallucination",
        "text": "Make a **Finesse Roll** against a target within *Close Range*. On a success, spend **2 Hope** to make the target hallucinate and start attacking everybody they was previously friendly. If the target doesn’t see any former ally, they will start attacking any other being they see. If they don’t see no valid target, they will knockout. All attacks against the hallucinating target are done with **Advantage**."
      }
    ]
  },
  {
    "name": "Operative",
    "className": "Agent",
    "spellcastTrait": "",
    "foundation": [
      {
        "name": "Target Mark",
        "text": "You can make an **Instinct Roll (12)** against a target within *Close range.* On a success, you may mark a **Stress** to Mark the target until your next *Rest*. You have **Advantage** on all rolls against a **Marked** Target. You can have as many simultaneous **Marks** as your **Instinct** score. For each additional target you try to **Mark**, increase the **Roll Challenge** by **1**."
      },
      {
        "name": "Martial Education",
        "text": "Whenever you roll with **Hope** you can, instead of taking a **Hope**, place a **D6**, known as **Martial Die**, on this card. You can have a maximum of **Martial Dice** equal to your **Proficiency**. When you make a *Melee Attack* action, you can spend any number of **Martial Dice** to roll and add the value to the **Attack** or **Damage** roll result."
      }
    ],
    "specialization": [
      {
        "name": "Martial Prowess",
        "text": "A number of times equal your **Proficiency** per *Rest*, you can reroll any **1** or **2** from your **Martial Dice**."
      },
      {
        "name": "Following Strike",
        "text": "When you make a successful **Attack Roll**, you can spend a **Hope** to add **1** weapon Damage Die from your secondary Weapon to the Damage Roll."
      }
    ],
    "mastery": [
      {
        "name": "Martial Preparation",
        "text": "You can do *Martial Preparation* as a Downtime move. To use this during a Rest, describe how you train with your party and give to each of them a **Martial Die**. They can use this **Die** in the same way you would use. On the beginning of the next *Long Rest* the **Martial Die** is cleared."
      },
      {
        "name": "Coordination",
        "text": "You can initiate an extra Tag Team Roll. Additionally, when an ally initiates a Tag Team Roll with you, they only need to spend **2 Hope**."
      }
    ]
  },
  {
    "name": "Keeper",
    "className": "Conduit",
    "spellcastTrait": "Instinct",
    "foundation": [
      {
        "name": "Brightside",
        "text": "When you fail with **Fear**, you gain a **Hope**."
      },
      {
        "name": "Sending Weapon",
        "text": "When you have a *Melee* weapon equipped, you can throw and basically control it to strike an enemy in *Close* range and return to you. You can mark a **Stress** to target an additional target in range with the same **Attack Roll**."
      }
    ],
    "specialization": [
      {
        "name": "Balancing the Odds",
        "text": "A number of times equal your **Proficiency**, describe a ritual you perform or preparation you make before attempting something very dangerous or face a foe or situation that clearly outmatches you. Then clear **2 Stress** and gain **2 Hope**."
      },
      {
        "name": "Refreshing Touch",
        "text": "Once per *Rest*, use an action and touch a being to clear **2 Hit Points** or **2 Stress** from them."
      }
    ],
    "mastery": [
      {
        "name": "Telekinetic Weapon",
        "text": "When you roll damage for your **Linked Weapon**, if any of your damage dice values match, you can roll an additional damage die for each match. These additional damage dice can’t be used to match and add more dice. For example: If you roll 3 **5**s, add **2** damage dice to your roll."
      }
    ]
  },
  {
    "name": "Wayseeker",
    "className": "Conduit",
    "spellcastTrait": "Instinct",
    "foundation": [
      {
        "name": "Force Roots",
        "text": "When you use a *Force* skill or use a weapon attuned to the *Force*, ou can mark a **Stress** to do one of the following: - Add **+2** to the action roll - Reroll any number of **Damage Dice**. - Hit an additional target within range"
      },
      {
        "name": "Trancing Combat",
        "text": "Spend a **Hope** to enter in a Trancing Combat state. This state continue active until the combat ends, you drop it, or you get unconscious. Gain the following: - Mark a **Stress** to deal **1D10** additional Damage on a successful attack. - While in this Trance, you gain +3 Major Damage Threshold."
      }
    ],
    "specialization": [
      {
        "name": "Bending Presence",
        "text": "While in Trancing Combat, you make the Force flow through you, striking awe. You have Advantage on **Presence Rolls**. If the roll is a success with **Hope**, you can choose to remove the **Fear** from GM’s **Fear Pool** instead of taking a **Hope**. Additionally, any enemy that you can see make Attack Rolls with Disadvantage against you."
      },
      {
        "name": "Cloaked",
        "text": "At any time, you can mark a **Stress** to cloak yourself. While cloaked, you gain the benefits of the **Hidden** condition and automatically lose the **Restrained** condition if you have it. You stop being cloaked when you roll with Fear or start a Short rest."
      }
    ],
    "mastery": [
      {
        "name": "Hardened",
        "text": "When you take this Mastery, increase your **Severe Damage Threshold** by **+4**."
      },
      {
        "name": "Accurate Trance",
        "text": "Your Trancing Combat extra damage becomes **2D12** instead of **1D10**."
      }
    ]
  },
  {
    "name": "Conciliator",
    "className": "Envoy",
    "spellcastTrait": "",
    "foundation": [
      {
        "name": "Heart of Diplomat",
        "text": "When speaking to a person you're trying to impress, persuade, or offend, you can spend a **Hope** and add **1D4** to the action roll against them."
      },
      {
        "name": "Conforting Speech",
        "text": "Once per short rest, you can use an action to give a heartfelt, inspiring speech. All allies who can hear you clear two Stress."
      }
    ],
    "specialization": [
      {
        "name": "Encouraging Support",
        "text": "A number of times per Session equal to half your **Proficiency** (Rounded up), you can encourage or exhort an ally who can hear you. You can do one of the following: - Allow them to find a simple object or tool they need - Help an Ally without spending **Hope**. - Make an Ally to clear a **Stress** or mark a **Hope**. - Give them an additional Downtime move during their next rest."
      },
      {
        "name": "Returning Encouragement",
        "text": "You can spend a number of **Hope** equal to the number of times you used the **Kindle** ability ****before, since the last *Long Rest*, to use **Kindle** again**.**"
      }
    ],
    "mastery": [
      {
        "name": "Deep Words",
        "text": "The **Kindle** die you distribute increases to **1D10**."
      },
      {
        "name": "Thoughtful Help",
        "text": "When you help an Ally, if you narrate how your bond with boost your help, the advantage die you give to help is a **D10**."
      }
    ]
  },
  {
    "name": "Investigator",
    "className": "Envoy",
    "spellcastTrait": "",
    "foundation": [
      {
        "name": "Contact Network",
        "text": "When you arrive in a prominent settlement or environment, you know somebody that calls this place home. Give them a name, note how you think they could be useful and choose one from the list below: - They owe me a favor, but they will be hard to find - They’re going to ask for something in exchange - They’re always in a great deal of trouble - We used to be together. It’s a long story - We didn’t part on great terms"
      }
    ],
    "specialization": [
      {
        "name": "Lending Hand",
        "text": "A number of times equal half your **Proficiency** (rounded up) per session, you can briefly call forth a shady contact. Immediately choose one of the benefits below and describe what brought them here to help you in this moment: - They provide **1** handful of credit, a tool, or a simple object that the situation requires - The next time you make an **Action Roll**, their help lets you increase either your **Hope** or **Fear** die result by **3**. - The next time you deal damage, they attack from an advantage point, adding **2D8** damage to your damage roll."
      }
    ],
    "mastery": [
      {
        "name": "Faithful Contacts",
        "text": "You can use your **Specialization** feature **2** additional times. You can also choose from the following options when you use it: - When you mark any number of **Hit Points**, the contact ruses to shield you, reducing the **Hit Points** marked by **1** - When you make a **Presence Roll** in conversation, they back you up. Your **Hope** die becomes a **D20** for the roll"
      }
    ]
  },
  {
    "name": "Pathfinder",
    "className": "Outrider",
    "spellcastTrait": "",
    "foundation": [
      {
        "name": "Direct Way",
        "text": "When you’re headed for a place you’ve previously visited, or you carry an object with you that has been there before, you can identify the shortest, most direct path to it. If, for some reason, you need to do a roll to find the path, make it with Advantage."
      },
      {
        "name": "Know where to look",
        "text": "You have Advantage on **Instinct Roll** to spot traps or to find hidden elements."
      }
    ],
    "specialization": [
      {
        "name": "Locked Defense",
        "text": "When you’re attacked by your **Locked Target**, your **Evasion** is increased by **+2**."
      },
      {
        "name": "Making Charts",
        "text": "Once per *Rest*, when doing a Roll related to any kind of Navigation, you can add your **Level** to the result."
      }
    ],
    "mastery": [
      {
        "name": "Explorer’s Grit",
        "text": "A number of times equal half your **Proficiency** (Rounded up) per *Session*, you may repeat a failed **Agility**, **Finesse** or **Instinct** roll and take the new result."
      },
      {
        "name": "Intuitive Path",
        "text": "After a *Long Rest*, put a number of tokens equal the sum of your **Knowledge** and **Instinct** traits, plus **1**. You can spend a token to do one of the following: - Identify up to last 3 places an item have been - Find the last known position of anyone you have an item of - Add **+3** to the **Hope** or **Fear** die on **Instict** and **Finesse** rolls."
      }
    ]
  },
  {
    "name": "Tracker",
    "className": "Outrider",
    "spellcastTrait": "",
    "foundation": [
      {
        "name": "Predator",
        "text": "Mark a **Stress** to increase your **Proficiency** by **1** on a damage roll. Whenever you deal a *Severe Damage* to a target, they also mark a **Stress**."
      },
      {
        "name": "Companion",
        "text": "You have a companion of your choice (At GM’s discretion). They always stay next to you unless you tell them otherwise. Take the Companion sheet. Whenever you level up your character, also choose a level up option for your Companion from this sheet."
      }
    ],
    "specialization": [
      {
        "name": "Extra Touch",
        "text": "When you take this Specialization, gain an additional Level Up for your Companion immediately."
      },
      {
        "name": "Disrupting Companion",
        "text": "When an enemy attacks you while they’re in your Companion’s *Very Close* range, you gain **+2 Evasion** against the attack."
      }
    ],
    "mastery": [
      {
        "name": "Further Customization",
        "text": "When you take this Mastery, gain **2** level up options for you Companion immediately."
      },
      {
        "name": "Defensive Bond",
        "text": "A number of times equal your **Proficiency** per *Long Rest*, when you or your Companion are going to mark any number of **Hit Points**, if you are within *Close Range* of your Companion, you can choose who rushes to the other and switch which of you take the Damage."
      }
    ]
  },
  {
    "name": "Juggernaut",
    "className": "Soldier",
    "spellcastTrait": "",
    "foundation": [
      {
        "name": "Defensive Layer I",
        "text": "When you take this foundation, increase all your Damage Thresholds by **+1**."
      },
      {
        "name": "Bulk Endurance",
        "text": "When you take Physical Damage, always reduce it by your Armor Score before applying it to your thresholds. You can still spend Armor Slots to reduce it further."
      }
    ],
    "specialization": [
      {
        "name": "Defensive Layer II",
        "text": "When you take this Specialization, raise all of your Damage Thresholds by **+2**."
      },
      {
        "name": "Damage Catcher",
        "text": "When an ally within *Close* range should take Damage, you can mark a **Stress** to sprint to their side and take the Damage instead."
      }
    ],
    "mastery": [
      {
        "name": "Defensive Layer III",
        "text": "When you take this Specialization, raise all of your Damage Thresholds by **+3**."
      },
      {
        "name": "Comeback",
        "text": "When an enemy damages an ally within *Very Close* range of you, the next successful attack you make against that enemy adds your **Level** to the **Damage Roll** result."
      }
    ]
  },
  {
    "name": "Marshal",
    "className": "Soldier",
    "spellcastTrait": "",
    "foundation": [
      {
        "name": "Attack Rows",
        "text": "When you deal enough **Hit Points** to defeat a target, you may spend a **Hope** to immediately repeat your last Attack action against a target within the action range."
      },
      {
        "name": "Retribution",
        "text": "When you are hit by an enemy in *Close Range*, immediately roll a number of **D6** equal to the amount of **Hit Points** you marked from this attack. For each result of **5+**, deal a **Hit Point** back to the enemy."
      }
    ],
    "specialization": [
      {
        "name": "Flanking Maneuvers",
        "text": "When you have at least an ally within *Very Close* range of an enemy, you can make an **Instinct roll (16)**. On a success, spend **1 Hope**, plus an additional **Hope** for each *Flanked* enemy, to make that target *Flanked*. A *Flanked* enemy is considered Vulnerable and has their Difficulty reduced by half your **Proficiency** (Rounded up)."
      },
      {
        "name": "Extended Defense",
        "text": "When a *Very Close* ally takes Damage, you can mark any of your **Armor Slots** to reduce the Damage by your **Armor Score**."
      }
    ],
    "mastery": [
      {
        "name": "Prioritization",
        "text": "Spend **2 Hope** to prioritize an enemy until your next Rest or you change your priority. When you make an **Attack Roll** against your prioritized enemy, you can switch the values on your **Hope** and **Fear** dice."
      },
      {
        "name": "Overkill",
        "text": "Whenever you would deal more **Hit Points** than the necessary to defeat an enemy, you may mark **2 Stress** to deal the remaining **Hit Points** to an enemy within the range of the Attack Action you made."
      }
    ]
  }
] as const
