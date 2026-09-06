// GERADO POR scripts/build-compendium.ts — NÃO EDITAR À MÃO.
// Fonte: specs/dh-sw.html
import type { Skill } from '@/types'

export const SKILLS: readonly Skill[] = [
  {
    "name": "Bare Bones",
    "domain": "Aegis",
    "level": 1,
    "recallCost": 0,
    "category": "Ability",
    "text": "While this card is in your Loadout, if you choose not to equipe armor, you have an Armor Score equal to 4 + your Level."
  },
  {
    "name": "Heavy Bash",
    "domain": "Aegis",
    "level": 1,
    "recallCost": 0,
    "category": "Ability",
    "text": "Make an attack with your primary weapon in melee range. On a success, you deal damage, push the target to Very Close range and may spend a **Hope** to also make them temporarily Vulnerable.\nOn a success with **Hope**, add an additional **1D6** to your damage dice on this attack."
  },
  {
    "name": "I protect you",
    "domain": "Aegis",
    "level": 1,
    "recallCost": 1,
    "category": "Ability",
    "text": "When an ally *Very Close* to you is going to take Damage, you may mark a **Stress** to stand in its way and take the damage instead. You may reduce the damage by spending Armor Slots normally.\nIf you mark a **Serenity**, reduce the damage by your **Strength** before spending any Armor Slot. You are also able to move and stand in the way of *Close* allies."
  },
  {
    "name": "Field Treatment",
    "domain": "Aegis",
    "level": 2,
    "recallCost": 2,
    "category": "Ability",
    "text": "Mark a Stress to make a Knowledge Roll (13) and target yourself or a being in Melee range. On a success, heal the target 2 Hit Points or 2 Stress. On a failure, heal the target 1 Hit Point or 1 Stress."
  },
  {
    "name": "Putting the back on it",
    "domain": "Aegis",
    "level": 2,
    "recallCost": 1,
    "category": "Ability",
    "text": "On a successful attack with a melee weapon, always add your **Strength Trait** to your **Damage Total**."
  },
  {
    "name": "Brace",
    "domain": "Aegis",
    "level": 3,
    "recallCost": 1,
    "category": "Ability",
    "text": "When you use an **Armor Slot** to reduce incoming damage, you may also spend any number of **Hope**. For each **Hope** you spend, reduce the incoming damage by your **Proficiency**."
  },
  {
    "name": "Feet Play",
    "domain": "Aegis",
    "level": 3,
    "recallCost": 2,
    "category": "Ability",
    "text": "A number of times equal half your **Proficiency** (Rounded up) per Short Rest, when an enemy in *Melee* Range would deal damage to you, you can avoid the damage entirely and safely move out of *Melee* range of the enemy."
  },
  {
    "name": "Provoke",
    "domain": "Aegis",
    "level": 4,
    "recallCost": 1,
    "category": "Ability",
    "text": "Make a **Presence** roll against a target. On a success, the target takes a **Stress** and the next time they act, they target you with *disadvantage*."
  },
  {
    "name": "Refreshing Wind",
    "domain": "Aegis",
    "level": 4,
    "recallCost": 2,
    "category": "Ability",
    "text": "After you finish a *Short Rest*, place tokens on this card until their numbers are equal your **Proficiency**.\nWhen you successfully strike an enemy, you may spend a token to clear **3 Stress** or **1 Hit Point**. On a success with **Hope**, you may also clear **3 Stress** or **1 Hope** of an ally within *Close Range*."
  },
  {
    "name": "Armorer",
    "domain": "Aegis",
    "level": 5,
    "recallCost": 1,
    "category": "Ability",
    "text": "While you are wearing an Armor and this card is in your Loadout, increase your Armor Score by **+1** plus your **Knowledge score**.\nDuring a *Short Rest*, if you choose to take the **Repair** Armor downtime action, everybody in your party also clears one additional Armor Slot."
  },
  {
    "name": "Conviction",
    "domain": "Aegis",
    "level": 5,
    "recallCost": 1,
    "category": "Ability",
    "text": "You speak with great power. When you attempt to use this to de-escalate a violent situation or get someone to follow your lead, roll with Advantage.\nYour willpower also emboldens you in moments of duress. When all of your **Stress** is marked, your damage rolls are made with **+1 Proficiency**."
  },
  {
    "name": "Deep Fortitude",
    "domain": "Aegis",
    "level": 6,
    "recallCost": 2,
    "category": "Ability",
    "text": "While this card is in your loadout, increase your **Severe Threshold** by half your **Level** (Rounded down).\nIf you take a **Minor Damage** (Below your **Major**), make a **D6** roll. On a **Proficiency-** result, you negate the damage."
  },
  {
    "name": "Inspiring Precision",
    "domain": "Aegis",
    "level": 6,
    "recallCost": 1,
    "category": "Ability",
    "text": "A number of times equal half your **Proficiency** (Rounded up) per *Short rest*, when you roll a *Critical Success* on an *Attack Roll*, you and all allies that can see or hear you may clear a **1D4 Hit Point** or **1D4+2 Stress**."
  },
  {
    "name": "Aegis Focus",
    "domain": "Aegis",
    "level": 7,
    "recallCost": 1,
    "category": "Ability",
    "text": "When a majority of the domain cards in your Loadout are from [Aegis](../Domains/Aegis%209e5ed7aad319477da8bb1ea20ca5cb0f.md) domain:\n- Your **Armor Score** increases by **+2** while this ability is in your Loadout.\n- Your maximum Stress is increased by **1**."
  },
  {
    "name": "Just a Graze",
    "domain": "Aegis",
    "level": 7,
    "recallCost": 1,
    "category": "Ability",
    "text": "When you would take Damage, you may mark a **Stress** to reduce the severity of the damage by one **Threshold**. When you do, roll **1D6**. If the result is **2-**, place this card into your Vault."
  },
  {
    "name": "Combat Charge",
    "domain": "Aegis",
    "level": 8,
    "recallCost": 2,
    "category": "Ability",
    "text": "After you finish a *Short Rest*, place a number of tokens equal half your **Proficiency** (Rounded up) on top of this card.\nYou can spend a token to muster a rousing shout or phrase that inspire your allies. You and all your allies that can hear you clear a **Stress**, gain a **Hope** and take advantage on **Attack Rolls** until you or an ally fails a roll with **Fear.**"
  },
  {
    "name": "Total Surge",
    "domain": "Aegis",
    "level": 8,
    "recallCost": 1,
    "category": "Ability",
    "text": "Once per *Long Rest*, mark **3 Stress** to push your body to its limits, increasing all of your Character Traits by **+2**. This lasts until your next rest."
  },
  {
    "name": "By a thread",
    "domain": "Aegis",
    "level": 9,
    "recallCost": 2,
    "category": "Ability",
    "text": "When you have only one Hit Point remaining, all of your damage thresholds are temporarily raised by **+5**. Additionally, any damage below your **Major Threshold** is ignored."
  },
  {
    "name": "Hold the Line",
    "domain": "Aegis",
    "level": 9,
    "recallCost": 1,
    "category": "Ability",
    "text": "Spend **2 Hope** to take a defensive stance that lasts until you move or fail a roll with **Fear**.\nWhile in this stance, any enemy that moves within *Very Close* range of you is immediately pulled into *Melee* with you and can choose one of the following:\n- Make a Weapon Attack without putting **Action Token** on **Action Tracker** against the target.\n- Make the target temporarily Restrained until GM spends a **Fear** to end this condition."
  },
  {
    "name": "Not Now",
    "domain": "Aegis",
    "level": 10,
    "recallCost": 4,
    "category": "Ability",
    "text": "While you have this card in your Loadout, when you mark your last Hit Point, instead of making a death move, you may roll **1D6** and clear that many marked Hit Points. Then put this card into your Vault."
  },
  {
    "name": "Serenity",
    "domain": "Aegis",
    "level": 10,
    "recallCost": 1,
    "category": "Ability",
    "text": "After you successfully evade an attack, you may clear a **Stress**. If you have no **Stress** to clear, instead gain a **Hope**."
  },
  {
    "name": "Elate",
    "domain": "Allure",
    "level": 1,
    "recallCost": 0,
    "category": "Ability",
    "text": "Make a **Presence** roll against a target within *Close* range. ON a success, you can temporarily keep their attention on you. Once per *Short Rest*, you may also mark a **Stress** on a success to deal a **Stress** to the target."
  },
  {
    "name": "Inspirational Words",
    "domain": "Allure",
    "level": 1,
    "recallCost": 1,
    "category": "Ability",
    "text": "After a *Long Rest*, place a number of tokens on this card equal to your **Presence score**. When you recite your words, spend a token and choose an option from the list below to grant to the ally you are speaking to. Before the next *Long Rest*, when you are without tokens, you can mark a **Stress** to refill your tokens.\n- Clear a **Stress**.\n- Heal a **Hit Point**.\n- Gain a **Hope**."
  },
  {
    "name": "Sharp Deceiver",
    "domain": "Allure",
    "level": 1,
    "recallCost": 0,
    "category": "Ability",
    "text": "Spend a **Hope** to take advantage on a roll you make to deceive or trick someone into believing something you tell them."
  },
  {
    "name": "Dissonating Speech",
    "domain": "Allure",
    "level": 2,
    "recallCost": 2,
    "category": "Ability",
    "text": "When you taunt or provoke a target within *Far* range, make a **Presence Roll** against them. On a success, roll a number of **D4** equal to your **Proficiency**. Take the highest value and deal that much **Stress** to the target."
  },
  {
    "name": "Truth Only",
    "domain": "Allure",
    "level": 2,
    "recallCost": 1,
    "category": "Ability",
    "text": "Make a **Presence roll** against a target within *Very Close* range. On a success, they can’t lie to you while they remain within *Close Range*. However, they are not compelled to speak.\nIf you ask them a question and they refuse to answer, they mark a **Stress** equal to your **Presence score** and the effect ends."
  },
  {
    "name": "Sensor Overload",
    "domain": "Allure",
    "level": 3,
    "recallCost": 1,
    "category": "Ability",
    "text": "Make an **Agility Roll** against any enemies within Close Range. On a success, spend a **Hope** to generate a field of confusing sounds, or flashing colors and lights, that temporarily *Stun* any enemies you succeed against, also dealing them a **Stress**. While *Stunned*, they can't move or act until the condition is cleared."
  },
  {
    "name": "Tactician",
    "domain": "Allure",
    "level": 3,
    "recallCost": 1,
    "category": "Ability",
    "text": "When you Help an Ally, they can add one of your **Experience** to their roll as well. When making a *Tag Team* roll, you can roll a **D20** for your **Hope** die instead of a **D12**."
  },
  {
    "name": "Perspective Shift",
    "domain": "Allure",
    "level": 4,
    "recallCost": 1,
    "category": "Ability",
    "text": "Spend a **Hope** to make a **Presence roll** against a target within *Close* range. On a success, you can choose to confuse the target or interfere with their point of view, positively moving their mood against you (If they are hostile, they get neutral. If neutral, they get friendly).\nIf you use this during combat, you can choose to either **Stun** the target or de-escalate the conflict."
  },
  {
    "name": "Warm Words",
    "domain": "Allure",
    "level": 4,
    "recallCost": 1,
    "category": "Ability",
    "text": "During a *Short Rest*, when you use the **Tend to Wounds** downtime move on another character, ou may speak supportive words to heal an extra Hit Point on them. When you do, also heal two of your own."
  },
  {
    "name": "Body Reader",
    "domain": "Allure",
    "level": 5,
    "recallCost": 2,
    "category": "Ability",
    "text": "Spend a **Hope** to read the body language of a target you can see within *Far Range* to identify the most immediate intention or strategy. Make a **Instinct roll** against them to gather deeper and detailed information."
  },
  {
    "name": "Discord Seed",
    "domain": "Allure",
    "level": 5,
    "recallCost": 1,
    "category": "Ability",
    "text": "You can whisper words of discord to an adversary in *Melee Range*. When you do that, make a **Presence roll (13)**. On a success, the target immediately takes a **Stress** and makes an attack against another enemy. After the attack is over, the target will realize what has happened.\nEach next use of **Discord Seed** against the same target add **+5** to the roll difficulty."
  },
  {
    "name": "Not Forgetting",
    "domain": "Allure",
    "level": 6,
    "recallCost": 1,
    "category": "Ability",
    "text": "When you mark one or more **Hit Points** from an attack, you may mark a **Stress** to place the same number of marked **Hit Points** of tokens on this card. On your next attack, you may clear all the tokens and increase your **Proficiency** by the same amount.\nIf you have any tokens remaining on this card when you take a *Rest*, clear that much **Stress** and clear the tokens."
  },
  {
    "name": "Pattern Action",
    "domain": "Allure",
    "level": 6,
    "recallCost": 1,
    "category": "Ability",
    "text": "Whenever you fail an **Action Roll**, your next **Action Roll** has Advantage."
  },
  {
    "name": "Allure Focus",
    "domain": "Allure",
    "level": 7,
    "recallCost": 1,
    "category": "Ability",
    "text": "When a majority of the domain cards in your Loadout are from [Allure](../Domains/Allure%20a69f7686e4c24a69bf4402d229cbf472.md) domain:\n- You may mark an Armor Slot instead of marking **Stress**.\n- When you get a critical success on an Action Roll, an enemy within *Close Range* takes **2 Stress**, or an ally within *Close Range* gains **2 Hope**."
  },
  {
    "name": "Sweet Talk",
    "domain": "Allure",
    "level": 7,
    "recallCost": 1,
    "category": "Ability",
    "text": "Whenever you make an **Action Roll** to Persuade, Lie, Deceive or Garner Favor, you can spend a **Hope** to reroll the **Hope** or **Fear** die and take the new result instead."
  },
  {
    "name": "Attention Center",
    "domain": "Allure",
    "level": 8,
    "recallCost": 3,
    "category": "Ability",
    "text": "Make a **Presence roll** against all enemies within *Far Range*. Any you succeed against temporarily keep their attention on you, narrowing their field of view and drowning out any sound but your own. You also mark a **Stress** to deal **Stress** to all targets who are focused on you."
  },
  {
    "name": "Recovery",
    "domain": "Allure",
    "level": 8,
    "recallCost": 1,
    "category": "Ability",
    "text": "During a *Short Rest* you can always choose to do one of the *Long Rest* options instead. You may spend a **Hope** to let one additional party member do the same."
  },
  {
    "name": "Art Mastering",
    "domain": "Allure",
    "level": 9,
    "recallCost": 0,
    "category": "Ability",
    "text": "When you get this card, choose **One** or **Two** Experiences.\n- If you choose **Two Experiences**, add **+2** to each.\n- If you choose **One Experience**, add **+3** to it.\nThen permanently put this card into your Vault."
  },
  {
    "name": "Leading Example",
    "domain": "Allure",
    "level": 9,
    "recallCost": 3,
    "category": "Ability",
    "text": "Whenever you mark an Armor slot, you can roll **1D4** and choose the same number of the result of allies who can see or hear you to gain a **Hope** or clear a **Stress**."
  },
  {
    "name": "Infamous",
    "domain": "Allure",
    "level": 10,
    "recallCost": 0,
    "category": "Ability",
    "text": "People know who you are and what you’ve done, and they will treat you differently because of it.\nWhenever you leverage your notoriety to get what you want, mark a **Stress** to add **+10** to roll result. All food and drinks for you are always free on friendly establishment, and everything else you buy is reduced in price.\nThis card **must remain** in your Loadout, but **doesn’t count** towards your domain card maximum."
  },
  {
    "name": "Refreshing",
    "domain": "Allure",
    "level": 10,
    "recallCost": 4,
    "category": "Ability",
    "text": "When you or an ally close to you has used a Skill that has an exhaustion limit (A number of times per Rest), spend any amount of **Hope** and roll that many **D6**. On a **6**, the exhausted feature is refueled.\nThis can't be used on any skill permanently placed in Vault."
  },
  {
    "name": "Lightning Reflexes",
    "domain": "Edge",
    "level": 1,
    "recallCost": 1,
    "category": "Ability",
    "text": "When you are targeted by an attack, mark a **Stress** to roll a **D4** and increase your **Evasion** against this attack by its value"
  },
  {
    "name": "Nimble",
    "domain": "Edge",
    "level": 1,
    "recallCost": 1,
    "category": "Ability",
    "text": "While this card is in your Loadout, add half (rounded up) of your **Agility** score to your **Evasion**."
  },
  {
    "name": "Sonic Shot",
    "domain": "Edge",
    "level": 1,
    "recallCost": 1,
    "category": "Ability",
    "text": "Make a Finesse roll against a target within Far range. On a success, spend a Hope to deal D8+2 Physical damage using your Proficiency. The target also gets temporarily Vulnerable."
  },
  {
    "name": "Analytic Approach",
    "domain": "Edge",
    "level": 2,
    "recallCost": 1,
    "category": "Ability",
    "text": "After a *Long Rest*, place a number of tokens equal to your **Knowledge trait** on this card, with a minimum of **1**. When you make an **Attack Roll** against a target, you may spend one token to choose an option below.\n- Make the attack with Advantage\n- Don’t add an Action Token to action tracker for this attack\n- Add **1D8** to your damage\nWhenever out of tokens, you may mark a **Stress** to refill your tokens as you do after a *Long Rest*.\nWhen you take a long rest, clear all ununsed tokens."
  },
  {
    "name": "Assistent Drone",
    "domain": "Edge",
    "level": 2,
    "recallCost": 1,
    "category": "Ability",
    "text": "Spend a **Hope** to deploy a small droid to your side until your next *Short Rest*, it takes damage or you use a Reaction to deactivate it. If you spend an additional **Hope**, they can be a floating droid. You can communicate with it or through it with other beings. You can make a **Finesse** or **Knowledge** roll to command it to perform simple tasks. You can also mark a **Stress** to see through its eyes.\nBesides that, the droid can do the following:\n- While it’s within *Very Close* range of you, it can use its power source to generate a personal shield to reduce an incoming Damage by your Armor Score plus your Proficiency. After that, the droid will deactivate unless you spend a **Hope** to keep its core powered.\n- You can spend an Action to command it to attack a target in *Close* of it. When you do this, make a **Finesse** or **Knowledge** attack roll against the selected target. On a success, deal **2D8** energy damage against the target."
  },
  {
    "name": "Electric Projectile",
    "domain": "Edge",
    "level": 3,
    "recallCost": 1,
    "category": "Ability",
    "text": "Make a **Finesse roll** against a target within **Far** range. On a success, mark a **Stress** to deal **D6** damage using your proficiency. The target’s Difficulty value is temporarily reduced by your **Proficiency**."
  },
  {
    "name": "Thick Tether",
    "domain": "Edge",
    "level": 3,
    "recallCost": 1,
    "category": "Ability",
    "text": "Make a **Finesse roll** against a target within *Far Range*. On a success, they mark a **Stress** and are temporarily restrained. If you target a flying being, this brings them to the ground before restraining them."
  },
  {
    "name": "Improvised Droid",
    "domain": "Edge",
    "level": 4,
    "recallCost": 2,
    "category": "Ability",
    "text": "Spend a **Hope** to chosse a group of objects around you and create a working small droid from them that obeys basic commands. Use a **Knowledge roll** to command it to take action. When necessary, it shares your **Evasion** and **Traits** and its attacks have range up to *Close* and deal **2D10** Energy damage.\nYou can only hold one droid at a time, and it falls apart when it is hit for any amount of damage."
  },
  {
    "name": "Nano Medfield",
    "domain": "Edge",
    "level": 4,
    "recallCost": 2,
    "category": "Ability",
    "text": "Once per *Short Rest*, you can use an Action to trigger a field of tiny healing robots around you. Everywhere within *Close Range* of you is covered by this small cloud of tiny floating drones, causing you and your allies in the area to immediately heal one Hit Point.\nYou can spend a **Hope** to increase the healing power by an additional Hit Point."
  },
  {
    "name": "Signature Move",
    "domain": "Edge",
    "level": 5,
    "recallCost": 1,
    "category": "Ability",
    "text": "When you take this card, you take on a signature move in battle that you can perform once per *Short Rest*. Name it and describe it. When you include its description in an action you’re taking, use a **D20** instead of a **D12** as your **Hope** die. If the attack succeeds, you may clear a **Stress**."
  },
  {
    "name": "Target Analysis",
    "domain": "Edge",
    "level": 5,
    "recallCost": 1,
    "category": "Ability",
    "text": "When observing a target, you can make a **Instinct Roll** against it. On a success, spend a **Hope** and ask the GM for two of the mechanical specifics from below:\n- Current Hit Points and Unmarked Stress.\n- Difficulty/Evasion and Damage Thresholds\n- Their Tactics and standard attack Damage Dice.\n- Their Moves and Experiences.\nAdditionally, you may also mark a **Stress** to remove one **Fear** from the GM’s pool"
  },
  {
    "name": "Crippling Strike",
    "domain": "Edge",
    "level": 6,
    "recallCost": 1,
    "category": "Ability",
    "text": "Spend a **Hope** to make a **Finesse roll** against a target in *Close Range*, on a success you deal half of your weapon damage (Rounded up), but making the target temporarily *Vulnerable*."
  },
  {
    "name": "Shocking Skin",
    "domain": "Edge",
    "level": 6,
    "recallCost": 1,
    "category": "Ability",
    "text": "Once per *Short Rest*, spend a **Hope** while touching a willing being and place a number of tokens equal to your **Knowledge trait** on this card.\nWhenever the target takes damage, you can remove any number of these tokens to roll that number of **D6** and add half your Level (Rounded down) to the roll. Reduce the incoming damage by the result and, if the attacker is in melee, deal the same result of energy damage back to the attacker.\nWhen you take a rest, clear all tokens."
  },
  {
    "name": "Bustling Load",
    "domain": "Edge",
    "level": 7,
    "recallCost": 2,
    "category": "Ability",
    "text": "Once per *Short Rest*, spend a **Hope** to push your body and senses to their maximum capabilities. Describe how your appearance and body language change, then place a **D6** on this card at value of **6**.\nWhile this die is active, it adds its value to every Action Roll you make. After you add its value to a roll, reduce it by **1**. When the die’s value reaches 0, or you take a rest, this state drops and you must mark an **Stress**."
  },
  {
    "name": "Edge Focus",
    "domain": "Edge",
    "level": 7,
    "recallCost": 2,
    "category": "Ability",
    "text": "When a majority of the domain cards in your Loadout are from [Edge](../Domains/Edge%20a661e82aa5ab4ec6ba60b74c2ae81216.md)  domain:\n- Increase your **Agility** by 1.\n- Once per *Short Rest*, you can do a **Finesse** or **Agility** roll using the double of the trait score."
  },
  {
    "name": "Capacitor Charge",
    "domain": "Edge",
    "level": 8,
    "recallCost": 1,
    "category": "Ability",
    "text": "When you should take **Energy damage**, place tokens on this card equal to the number of Hit Points that Damage would do. Then, reduce the incoming damage in half (rounded up).\nWhen you make a successful attack roll against a target, you can spend any number of the tokens from this card to deal an additional **1D6 Energy damage** per token. On your next rest, clear all tokens."
  },
  {
    "name": "Exposing Blow",
    "domain": "Edge",
    "level": 8,
    "recallCost": 3,
    "category": "Ability",
    "text": "When you make a successful attack, you may mark a **Stress** to make the next successful attack against the same target do an additional **2D12** damage."
  },
  {
    "name": "Drone Nest",
    "domain": "Edge",
    "level": 9,
    "recallCost": 1,
    "category": "Ability",
    "text": "Make a **Finesse Roll (17)**. On a sucess, pick a spot within *Close Range* of you to put a Drone Nest. Any hostile being who moves into or starts its action within *Close Range* of the Nest, takes **5D10** Physical Damage."
  },
  {
    "name": "Tech Savvy",
    "domain": "Edge",
    "level": 9,
    "recallCost": 2,
    "category": "Ability",
    "text": "After a *Long Rest*, place on this card a number of tokens equal to how many **Edge** cards you have in your Loadout and Vault.\nWhenever you would make a **Roll**, you may spend any number of these tokens to add **+1** to the result, before knowing the result, for each used token.\nWhenever you roll a **Critical Success** on a **Roll** using an **Edge card**, gain a token.\nWhen you take a *Long Rest*, clear all the tokens."
  },
  {
    "name": "Adamant Armor",
    "domain": "Edge",
    "level": 10,
    "recallCost": 1,
    "category": "Ability",
    "text": "Anytime you mark any number of Armor Slot, roll an amount of **D6** equal to the amount of Armor Slots you are going to mark. If any result in **5+**, you don’t have to mark that slot."
  },
  {
    "name": "Harvest Strike",
    "domain": "Edge",
    "level": 10,
    "recallCost": 3,
    "category": "Ability",
    "text": "Spend a **Hope** and make an **Attack Roll**. The GM will tell you all the enemies within your attack that it would succeed against.\nA number of times equal half your **Proficiency** (Rounded up) per *Long Rest*, choose one of these enemies and deal **5 Hit Points** of damage."
  },
  {
    "name": "Awareness Projection",
    "domain": "Essence",
    "level": 1,
    "recallCost": 0,
    "category": "Force",
    "text": "Make a **Forcewield Roll (12)**. On a success, once per *Short Rest*, you project your perception and vigilance to a place you know within *Far Range*, with radius no bigger than *Close Range*.\nWhile you are concentrating, you know everything that is happening in the chosen area. If you are doing anything else, you must make a **Forcewield Roll (14)** to perceive any activity. The GM can give you Advantage if the activity you are performing while projecting your awareness is simple enough."
  },
  {
    "name": "Cron of Fae",
    "domain": "Essence",
    "level": 1,
    "recallCost": 1,
    "category": "Holocron",
    "text": "### Telekinesis\nMake a **Forcewield Roll** against an object or target within *Far* range. On a success, you can move it anywhere within *Far* range of its current position using the Force.\nYou may mark **1** or more **Stress** to harm the target with this movement. If you do so, deal **1D20** **Physical damage** per marked **Stress**.\nIf you are hitting a being with the target, divide the damage equally between the two.\nYou can also spend a **Hope** to take down the target and make them temporarily proned.\n### Art of Movement\nYou can mark a **Stress** to move anywhere within *Far* range without making an **Agility roll**.\nAlso, if you need to make a roll to overcome obstacles or hard terrain, add your **Proficiency** to the roll result.\n### Sense Surroundings\nSpend a **Hope**, for the next 10 minutes you sense all beings within *Close Range* of you. When in combat against a target within this range, you overcome any disadvantage from *Blindness* status, and you are able to find anyone who is hidden using methods not related to the Force.\nIf you spend an additional **Hope**, add your **Proficiency** to your **Evasion** until your next action."
  },
  {
    "name": "Cron of Simus",
    "domain": "Essence",
    "level": 1,
    "recallCost": 2,
    "category": "Holocron",
    "text": "Each time you enter in combat or do an Action that contribute to Action Tracker, place tokens over this card until you have a number of tokens equal your **Proficiency**.\n### Blade Parry\nSpend a token from this card to use this skill.\nWhen you are going to take Damage from a *Melee range* attack, if you are wielding a *Lightsaber* type weapon, you can make a **Reaction Roll (15)** using your **Forcewield** **trait** plus your **Agility** score. On a sucess, you may spend a **Hope** to reduce the incoming Damage by the number of weapon’s die sides added of your **Agility** score.\n### Bolt Defense\nSpend a token from this card to use this skill.\nWhen you are going to take Damage from an attack beyond *Melee range*, if you are wielding a *Lightsaber* type weapon, you can make a **Reaction Roll (15)** using your **Forcewield** **trait** plus your **Finesse** score. On a sucess, you may spend a **Hope** to reduce the incoming Damage by the number of weapon’s die sides added of your **Finesse** score.\n### Double Vision\nWhile this card is in your Loadout, add half of your **Forcewielding trait** score, to your **Evasion** (rounded up)."
  },
  {
    "name": "Cron of Fohargh",
    "domain": "Essence",
    "level": 2,
    "recallCost": 2,
    "category": "Holocron",
    "text": "### Shelter Circle\nPlace **2** **Action Token** in the **Action Tracker** to spend a **Hope** and enter in a meditative defense stance. Until you mark any number of **Hit Point** or take another action, you and any ally within *Very Close* range of you increase each **Evasion** by your **Forcewield** **trait** score.\nEvery attack against any ally in *Very Close* range of you is done with **Disadvantage**.\n### Mynock Way\nWhen you are going to make an attack roll using a *Lightsaber* weapon, you may use your **Knowledge** as your Weapon Trait for the roll.\n### Resilience Armor\nUse an action to spend a **Hope** to roll **1D6** plus your **Forcewield score**. Take the value and add to your Armor Score on the next Armor Slot you mark. This can’t be stacked.\nIf you spend a **Strife** or mark a **Serenity**, you can mark a **Stress** to apply this value"
  },
  {
    "name": "Cron of Vaunk",
    "domain": "Essence",
    "level": 2,
    "recallCost": 2,
    "category": "Holocron",
    "text": "### Sun Djem\nSpend a **Hope** to make a **Finesse roll** against a target within *Very Close range*, increasing their Difficulty by half their Attack modifier (rounded down). On a success, consider the target’s weapon die as Threshold. If your damage result meet or beat this value, the target is disarmed. If your damage result is at least the double of target’s weapon Threshold, consider the weapon destroyed.\n### Contention Maneuver\nWhen you fail a *Lightsaber* weapon attack roll, you may mark a **Stress** to add increase your Evasion by half your **Forcewield trait** (Rounded up) until your next attack.\n### Force Leap\nIf you are doing this in a situation where the Action Tracker is active, you must mark a **Stress** to perform this action.\nYou can jump up to 8 times your height, usually used to reach high places. It can also be used to jump in other directions, allowing to quick movement.\nYou don’t need to spend an Action Token to move towards a point within *Far Range*. However, this skill doesn’t remove the need of **Agility roll** if applicable."
  },
  {
    "name": "Cron of Draay",
    "domain": "Essence",
    "level": 3,
    "recallCost": 2,
    "category": "Holocron",
    "text": "### Invigorating Strike\nA number of times equal your **Proficiency** between Rests, when you make a successful strike against an enemy, you may clear **3 Stress** or one **Hit Point**. On a success with **Hope**, you may also clear **3 Stress** or one **Hit Point** of an ally within *Close Range* of you.\nIf you mark a **Strife**, increase the number of cleared **Stress** or **Hit Point** by one.\n### Blurring Strike\nWhen you cause an enemy to mark at least one **Hit Point**, spend **2 Hope** to temporarily increase your **Evasion** by the number of **Hit Points** you dealt. This bonus lasts until after the next attack that targets you.\n### Oblation\nYou can make a **Forcewield Roll (13)**. On a success, spend a **Hope** to clear a **Hit Point** or a **Stress** of any target within *Melee Range* of you, including yourself.\nIf you are doing this to a target other than yourself, you may spend a **Strife** or mark a **Serenity** to mark one of your **Hit Point** to clear an extra **Hit Point** or **Stress** for the same target."
  },
  {
    "name": "Cron of Lok",
    "domain": "Essence",
    "level": 3,
    "recallCost": 2,
    "category": "Holocron",
    "text": "### Contrived Power\n**Confict**: *Mark a **Strife** or spend a **Serenity** to use this skill*\nWhile this card is in your Loadout, everytime you roll with **Hope**, before the roll resolves, you can mark a **Stress** to make it a roll with **Fear**.\nWhen you do this, choose one of the following:\n- Add **3+Forcewield score** to your roll result\n- Add a number of **D8** equal to half your **Proficiency** (rounded up) to your Damage roll\n### Command\nSpend a **Hope** to give a one word command to a creature. Then make a **Forcewield roll** against target’s **Presence roll**. On a sucess, the target mark a **Stress** and comply with the given command.\n### Pulse Wave\nMake a **Forcewield Roll** against a number of targets up to your **Forcewield Trait** score that are within *Very Close* range. Each target you succeed against is blasted back to *Far* range and take **D10** Physical damage using your **Proficiency**."
  },
  {
    "name": "Cron of Vrook",
    "domain": "Essence",
    "level": 4,
    "recallCost": 2,
    "category": "Holocron",
    "text": "### Hawk-Bat Way\nWhen you are going to make a weapon Attack Roll with a *Lightsaber*, you can use **Agility trait** as the weapon trait.\n### Aggression Aim\nA number of times equal to your **Base Proficiency** per *Short Rest*, you can apply all your focus toward a single target. Choose that target.\nUntil you defeat it, select another target, or the battle ends, add **+1** to your **Proficiency** when acting against the chosen target. For any other being, your **Proficiency** should be considered **-1** (With a minimum of 1).\n### Clench\nTarget an object or creature within *Far* range. The target stops in space, unable to move, exactly where it is until the end of the scene. If a creature tries to move it, or if it’s a being that tries to move itself, make a **Forcewield Roll** against them to maintain the hold.\nEach action you make while holding something contributes with **2 Action Tokens**.\nIf you mark a **Strife** you can mark a **Stress** to use the Force to hold the target tighter, dealing 2**D8** Physical damage that can’t be reduced by Armor Slot."
  },
  {
    "name": "Cron of Zez-Kai",
    "domain": "Essence",
    "level": 4,
    "recallCost": 2,
    "category": "Holocron",
    "text": "### Redirect\nWhile wielding a *Lightsaber* weapon, when you successfully evade an attack from beyond melee range, or avoid marking any **Hit Point** from it without using an Armor Slot, you may roll a number of **D6** equal to your proficiency. If any roll a **6**, you may mark a **Stress** to redirect the attack against an enemy within *Close* range of you. If you mark an additional **Stress**, you can redirect the attack against the person who made it against you, independent of range, with Advantage.\n### Riposte\nWhile wielding a *Lightsaber* weapon, when you successfully evade an attack from melee range, or avoid marking any **Hit Point** from it without using an Armor Slot, you may mark a **Stress** to perform a Weapon attack roll against the opponent who attacked you, without placing an Action Token.\n### Deflective Dome\nA number of times equal your **Proficiency** per *Short Rest*, spend a **Hope** to completely negate any incoming damage against you.\nIf you mark a **Serenity**, you can use this to negate an incoming damage against a *Very Close* ally."
  },
  {
    "name": "Cron of Othone",
    "domain": "Essence",
    "level": 5,
    "recallCost": 2,
    "category": "Holocron",
    "text": "### Moderation Approach\nWhen you are going to make a weapon Attack Roll with a *Lightsaber*, you may your **Forcewield trait** as the weapon trait.\n### Rancor Way\nYou may spend a **Hope** to perform two attacks using one only **1 Action Token**. For this action, one of them must be a weapon attack while the other must be a Force related attack. Each attack rolls are done independently, each one of them dealing only Half Damage (Rounded up).\nIf at least one of selected attacks succeed, the target marks an **Stress** besides the received damage.\n### Valor\nSpend **3 Hope** to charge your body with the Force. On the next successful weapon or body attack, double your **Proficiency** on the damage roll."
  },
  {
    "name": "Cron of Rath",
    "domain": "Essence",
    "level": 5,
    "recallCost": 2,
    "category": "Holocron",
    "text": "### Spark\nA number of times equal to your **Proficiency** per *Short Rest*, make a **Forcewield Roll** against a target within *Close Range*. On a success, the target must make a **Strength roll (18)**. On a failure, a number of **D8** equal to your **Forcewield Trait** in Energy Damage. On a success, they take half damage (Rounded up).\nIf you mark a **Strife** or spend a **Serenity**, add **3D8** to the damage roll.\n### Projected Strike\nYou project the Force through your body to project strikes without the need of touching the target, or enhancing your body movements. Make an **Unarmed Attack roll** against a target within *Very Close range*. On a success, instead of normal Unarmed Damage roll, you roll **D6** with your **Proficiency**, adding your **Forcewield Trait** to roll result.\nYou may spend **Hope**, before the Damage roll, to increase your **Proficiency** by **+1** for each **Hope** spent.\n### Wave Blast\nMake a **Forcewield Roll** against all enemies within melee range of you. Any you succeed against are hurdled into *Far range* and dealt **D8+3** physical damage using your **Forcewield Trait**."
  },
  {
    "name": "Cron of Kaedan",
    "domain": "Essence",
    "level": 6,
    "recallCost": 2,
    "category": "Holocron",
    "text": "### Assured Strike\nWhenever you make a *Lightsaber* Weapon attack roll, before the roll resolves, you may reduce your **Proficiency** by **-1** how many times you want, as long as your **Proficiency** for this attack don’t get bellow **1**. Then, increase the **Attack Roll** result by the same number you took from you **Proficiency**.\nAfter this attack is finished, your **Proficiency** returns to its base value.\n### Vornskr Ferocity\nAny moment during a *Lightsaber* Weapon attack roll, you may spend a **Hope** to do one of the following:\n- Mark a **Strife** to increase the result of your **Attack** or **Damage** roll by the total **Strife** you have.\n- Spend a **Strife** to increase the result of your **Attack** or **Damage** roll by the number of **Fear** the GM has.\n### Battlemind\nWhen all of your **Stress** is marked, your attacks are made with **+1** **Proficiency**."
  },
  {
    "name": "Cron of Vos",
    "domain": "Essence",
    "level": 6,
    "recallCost": 2,
    "category": "Holocron",
    "text": "### Echoes\nWhile touching an object, you can make a **Forcewield roll (14)** to sense the moments which the object was present. On a success, you get two information about moments from the object’s past. On a failure, you get only one information. You may spend a **Hope** to focus on specific information that you try to obtain, as if you were asking some question.\nIf you spend a **Serenity** or mark a **Strife**, you may use this skill against a being you are touching, to obtain the information from its memories. Then, the target mark as many **Stress** as the number of memories accessed.\n### Foresight\nYou can see the reality possibilities through the Force. Once per *Long Rest*, immediately after the GM conveys the consequences of your rolling with **Fear**, you may make that event your **Foresight**. You instead mark a **Stress** and rescind the action and consequences like they never happened and choose another action instead."
  },
  {
    "name": "Cron of Shan",
    "domain": "Essence",
    "level": 7,
    "recallCost": 3,
    "category": "Holocron",
    "text": "### Tutaminis\nWhen you are going to take an *Energy Damage*, you may mark a **Stress** to make a **Forcewield Roll (19)**. On a success, you negate all the incoming *Energy Damage* from this attack. On a failure, you take Half Damage.\nYou may also, on a Success, spend **2 Hope** to perform an attack against any target without using Action Token. In case your attack hits the target, add the Half the Damage you would receive (Rounded up) to your Damage Roll result.\n### Eruption Pound\nSpend **2 Hope** to make a **Forcewield Roll** against any enemies within *Very Close* range of you. All you succeed against are thrown back to *Far* range and must make a **Reaction Roll (17)**. On a failure they also take **4D10+8** Physical damage and become temporarily Vulnerable. On a success, they don't get Vulnerable and take half damage (Rounded up).\n### Battle Meditation\nMake a **Forcewield Roll (17)**. On a success, once per *Short Rest*, you start to emanate an invisible aura through the Force, affecting everyone within *Far Range* of you. When you do, place a **D10** on this card at its highest value.\nAt any moment, you and your allies can use the die value to increase the result of any roll you make, or to decrease the result of any roll made against you or any of your allies.\nThen reduce the die’s value by **1**.\nThe aura ends when the die reaches **0**, you stop it, or you get unconscious."
  },
  {
    "name": "Essence Focus",
    "domain": "Essence",
    "level": 7,
    "recallCost": 1,
    "category": "Ability",
    "text": "When a majority of the domain cards in your Loadout are from [Essence](../Domains/Essence%200900fcc63fa348229f4513fb04eb1afe.md) domain:\n- You can always mark a **Stress** to add your **Proficiency** to a **Forcewield roll**.\n- Once per *Short* *Rest*, when incoming damage would make you to mark Hit Points, you may choose to mark the same number of **Stress** or spend that much of **Hope** instead.\n- Once per *Short Rest*, you may replace this card with any card from your Vault without paying a *Recall* cost."
  },
  {
    "name": "Cron of Kriss",
    "domain": "Essence",
    "level": 8,
    "recallCost": 3,
    "category": "Holocron",
    "text": "### Holding Together\nOnce per *Short Rest*, you can use an action to absorb **Stress** from a willing creature you can touch. The target describes what intimate knowledge or emotions leak from their mind in this moment between you.\nThen, for each absorbed **Stress**, you choose to gain a **Hope** or mark a **Serenity**.\n### Merging Symphony\nWhen helping an ally to make a roll, you may mark a **Stress** to add one of your Experiences that relates to the action.\nAlso, when participating on a Group Roll, you may mark **2 Stress** to make all participants roll with Advantage.\n### Restoration\nAfter a *Long Rest*, place a number of tokens equal to your **Forcewield Trait** on this card.\nYou can connect yourself with a creature within *Very Close* range and spend any number of tokens to heal them for **2 Hit Points** per token.\nYou can also spend a token to clear a **Stress**, end the *Vulnerable* condition, or end other condition (Although the number or required tokens depends on the condition).\nEach spent token increases the *Action Tracker* by **1** if it’s active.\nYou can mark a **Serenity** to place new tokens until you have the same number as your **Forcewield Trait**.\nWhen you take a *Long Rest*, clear all remaining tokens."
  },
  {
    "name": "Cron of Mann",
    "domain": "Essence",
    "level": 8,
    "recallCost": 2,
    "category": "Holocron",
    "text": "### Deep Empathy\nMake a **Forcewield Roll** against the target. On a success, you may spend a **Hope** to know the exact target’s feeling and intent. You can also do one of the following:\n- Mark a **Serenity** to estimulate calm and peaceful feelings or thoughts, making the target clear as many **Stress** as your **Proficiency**.\n- Mark a **Strife** to confuse and disrupt target’s mind, making them mark a number of **Stress** equal to your **Proficiency**. You can also mark a **Stress** to temporarily **Stun** the target.\n### Combat Meld\nOnce per *Long Rest*, you may choose one:\n- Spend **3 Hope** to initiate an extra **Tag Team** attack with an ally, giving a **D6** for each to add in the Attack or Damage roll.\n- Spend **3 Hope** to initiate an extra **Tag Team** attack with two allies instead of one."
  },
  {
    "name": "Cron of Surik",
    "domain": "Essence",
    "level": 9,
    "recallCost": 3,
    "category": "Holocron",
    "text": "### Shared Feature\nOnce per Short Rest, you can spend a **Serenity**, or mark a **Strife**, to choose a **Trait** or **Experience** from an ally.\nThe Trait score can’t be higher than your Forcewield trait score, and the Experience level must be bellow your highesr Experience.\nMark a number of **Stress** equal half of the chosen **Feature** (Rounded up) and you can use it as if you had it until your next Downtime period, or you get unconscious.\n### Bonded Skill\nOnce per *Short Rest*, you can choose a level **8 or lower** card from another player’s Loadout. Spend a number of **Hope** equal to half chosen card’s level (Rounded up), and this skill can mimic the features of chosen card."
  },
  {
    "name": "Shatterpoint",
    "domain": "Essence",
    "level": 9,
    "recallCost": 1,
    "category": "Force",
    "text": "Make a **Forcewield roll (16)**. On a success, spend a **Hope** to see, through the Force, the key elements, fractures or scars of a situation, object or being.\nThe GM narrates the most important individual or item that would affect the future. If used against a person, you know their weakpoints and how many **Hit Points**, **Stress** and **Armor** slots they have.\nYou may mark a **Stress** to shatter the target throught the Force, dealing **3D8** plus a number of **D8** equal to your **Forcewield trait** score, and are **Vulnerable**.\nIf you are dealing damage, you can also spend a **Serenity** or mark a **Strife** to deal an extra **Hit Point** damage."
  },
  {
    "name": "Cron of Revan",
    "domain": "Essence",
    "level": 10,
    "recallCost": 3,
    "category": "Holocron",
    "text": "### Something Else\nYou can concentrate for a moment (Using 2 Action Tokens if with Action Tracker active) to make a **Forcewield roll (18)**. On a success, spend **2 Hope** to sum up your marked **Strife** and **Serenity** together and redistribute the values as you will between them.\n### Morichro\nMake a **Forcewield roll** against an organ of a target within *Close Range*. You can target a vital organ, if you do so, increase the roll difficulty by **+5**. On a success, spend **3 Hope** to stop the targeted organ, dealing **D10** with half your **Forcewield trait** (Rouded up) score of internal damage (Not reduced by Armor Slot).\nIf you spend a **Serenity**, you may add **4D10** to the Damage Roll.\n### Unnatural Power\nMake a **Forcewield Roll (25)**. On a success, you may restore one creature that has been dead no longer than **50 days**. Then roll **1D12**. On a result above the sum of your **Proficiency** and **Forcewield trait**, put this card into your Vault until you spend **5 Hope** to unlock it.\nOn a failure, this cannot be attempted again for at least a week, and the consequences of failing can have unexpected effects on the dead or on you."
  },
  {
    "name": "Cron of Sunrider",
    "domain": "Essence",
    "level": 10,
    "recallCost": 4,
    "category": "Holocron",
    "text": "### Power of Many\nOnce per Long Rest, spend **5 Hope** to focus on one or more willing creatures that wish to be bonded.\nUntil your next Short Rest, any creatures that have this union with each other can always share **Hit Points** Slots, **Stress** Slots and **Hope** Slots between them.\n### Severance\nAfter a *Long Rest*, put on this skill a number of tokens equal to half your **Proficiency** (Rounded up). You can spend a token to do one of the following:\n- Spend **2 Hope** to make a **Forcewield roll (23)** against a Force wielder target within Very Close range. On a success, spend extra **2 Hope** to complete the proccess and completely sever the target from their connection with the Force.\n- Make a Forcewield roll (28) against a Force Wielder with their connection severed within Very Close range. On a success, spend 4 Hope to restore their connection with the Force. Their alignment shifts to half their previous value (Rounded down)."
  },
  {
    "name": "Burst Strike",
    "domain": "Havoc",
    "level": 1,
    "recallCost": 0,
    "category": "Ability",
    "text": "When you make a successful attack using a weapon, you may also spend a **Hope** to use the same roll against every other enemy within weapon’s range. Any additional enemies you succeed against with take Half Damage (rounded up)."
  },
  {
    "name": "I want more",
    "domain": "Havoc",
    "level": 1,
    "recallCost": 1,
    "category": "Ability",
    "text": "When you roll your damage dice, you may rerool any **1** or **2** once. If you do, you must take the new result."
  },
  {
    "name": "Reprisal",
    "domain": "Havoc",
    "level": 1,
    "recallCost": 1,
    "category": "Ability",
    "text": "When you take damage from a being in *Melee Range*, you may mark a **Stress** to immediately deal weapon damage to it, at half **Proficiency** (rounded up)."
  },
  {
    "name": "Arms Bond",
    "domain": "Havoc",
    "level": 2,
    "recallCost": 1,
    "category": "Ability",
    "text": "Once per *Long Rest*, if you compliment someone or ask them about something they are good at, you may both take **3 Hope**."
  },
  {
    "name": "Daring Presence",
    "domain": "Havoc",
    "level": 2,
    "recallCost": 0,
    "category": "Ability",
    "text": "Whenever you make a **Presence** roll against a hostile or unfriendly target, you can also add your **Strength** trait to the roll."
  },
  {
    "name": "Flame Embrace",
    "domain": "Havoc",
    "level": 3,
    "recallCost": 1,
    "category": "Ability",
    "text": "Make an **Agility Roll** against a target within Very Close range. On a success, the target is engulfed in flames, dealing **1D20+3** energy damage and temporarily catching them on fire.\nAny time a being tries to act while on fire, if it is still on fire at the end of its action, it must take an additional **2D6** energy damage."
  },
  {
    "name": "Shifting Savagery",
    "domain": "Havoc",
    "level": 3,
    "recallCost": 2,
    "category": "Ability",
    "text": "You can choose to use the **Character Trait** of your choice on an equipped weapon, rather than the trait called by the weapon.\nWhen dealing damage, you may mark a **Stress** to take the maximum value of one of your Damage Die instead of rolling it."
  },
  {
    "name": "Reliable Armor",
    "domain": "Havoc",
    "level": 4,
    "recallCost": 0,
    "category": "Ability",
    "text": "Increase your Armor Score by **+2** while you are wearing armor and this card is in your Loadout.\nOnce per *Short Rest*, you may use an Armor Slot without marking it."
  },
  {
    "name": "Support Inspiration",
    "domain": "Havoc",
    "level": 4,
    "recallCost": 2,
    "category": "Ability",
    "text": "When an ally *Close* to you fails a roll, you may spend **2 Hope** to allow them to reroll either their **Hope** or **Fear** die and take the new result."
  },
  {
    "name": "Fateful Strike",
    "domain": "Havoc",
    "level": 5,
    "recallCost": 1,
    "category": "Ability",
    "text": "When you land a *Critical Hit* on an **Attack Roll**, choose tow of the following:\n- Clear a Hit Point\n- Clear a marked Armor Slot.\n- Clear a **Stress**.\n- Mark **+1 Hit Point** on the target of the attack."
  },
  {
    "name": "Might",
    "domain": "Havoc",
    "level": 5,
    "recallCost": 0,
    "category": "Ability",
    "text": "When you take this card, choose **two** from below. Then place this card into your **Vault permanently**\n- Permanently add one additional **Stress** slot\n- Permanently add one additional **Hit Point** slot.\n- Permanently raise your Damage Thresholds by **+2**."
  },
  {
    "name": "Fury",
    "domain": "Havoc",
    "level": 6,
    "recallCost": 0,
    "category": "Ability",
    "text": "Before making an **Attack Roll**, you may mark a **Stress** to temporarily increase your **Proficiency** by **+1** until the end of the attack."
  },
  {
    "name": "Steeled",
    "domain": "Havoc",
    "level": 6,
    "recallCost": 2,
    "category": "Ability",
    "text": "While this card is in your Loadout, increase your **Proficiency** and your **Damage Thresholds** by the number of **Scar** (A **Hope** slot that is permanently crossed out) you have."
  },
  {
    "name": "Havoc Focus",
    "domain": "Havoc",
    "level": 7,
    "recallCost": 1,
    "category": "Ability",
    "text": "When a majority of the domain cards in your Loadout are from [Havoc](../Domains/Havoc%20c2a54534b4e14d359d0d9604b7aa4232.md) domain:\n- **Attack Rolls** always take **+2** to their result.\n- Increase your *Severe Damage* Threshold by **+4**."
  },
  {
    "name": "Peripheral Hit",
    "domain": "Havoc",
    "level": 7,
    "recallCost": 1,
    "category": "Ability",
    "text": "Whenever you make an attack that misses its target, you may mark a **Stress** to still hit the target for weapon damage at half **Proficiency** (rounded up)."
  },
  {
    "name": "Harming Precision",
    "domain": "Havoc",
    "level": 8,
    "recallCost": 1,
    "category": "Ability",
    "text": "Whenever you make a successful attack with a weapon, add either your **Finesse** or **Agility** trait to the damage."
  },
  {
    "name": "Rampage",
    "domain": "Havoc",
    "level": 8,
    "recallCost": 3,
    "category": "Ability",
    "text": "You may mark **2 Stress** to go into a rampaged state until there are no more threats within sight.\nWhile in this state, you cannot use *Armor Slots*, you have **+2** to your **Proficiency**, and your *Severe Damage* Threshold is increased by **+8**."
  },
  {
    "name": "Great Gouge",
    "domain": "Havoc",
    "level": 9,
    "recallCost": 3,
    "category": "Ability",
    "text": "Whenever you deal enough Weapon damage to defeat an enemy, you can gain a **Hope** or clear a **Stress**.\nWhen you roll a Critical Success on a weapon attack, you gain an additional **Hope** or clear an additional **Stress**."
  },
  {
    "name": "Staggering Presence",
    "domain": "Havoc",
    "level": 9,
    "recallCost": 2,
    "category": "Ability",
    "text": "**Presence Roll (15)**. On a success, spend **2 Hope** to add half your **Proficiency** (Rounded up) to your **Presence score**.\nWhile you have **Staggering Presence** active, any adversary must always mark a **Stress** when they target you with an attack."
  },
  {
    "name": "Blazing Fighter",
    "domain": "Havoc",
    "level": 10,
    "recallCost": 0,
    "category": "Ability",
    "text": "When you make a successful attack against an enemy, instead of rolling for damage you may mark **5 Stress** to deal the target a number of **Hit Points** equal to **1D4** plus the amount of **Hit Points** you currently have marked."
  },
  {
    "name": "Ravage",
    "domain": "Havoc",
    "level": 10,
    "recallCost": 2,
    "category": "Ability",
    "text": "While this card is in your Loadout, your successful Weapon attacks always make the target to mark an extra **Hit Point**.\nIn addition, increase your **Evasion** by half your **Proficiency** (rounded up). All incoming Damage against you also make you mark an extra **Hit Point**."
  },
  {
    "name": "Hidden Blades",
    "domain": "Veil",
    "level": 1,
    "recallCost": 1,
    "category": "Ability",
    "text": "Spend a Hope to conjure throwing blades that strike any enemies Very Close to you. Make a Agility Roll and all targets that you succeed against take D8+2 Physical damage using your Proficiency. If any targets you hit are currently Vulnerable, they take an additional 1D8 Physical damage."
  },
  {
    "name": "Quick Hands",
    "domain": "Veil",
    "level": 1,
    "recallCost": 0,
    "category": "Ability",
    "text": "You have advantage on any attempt to pick a lock unlinked to computer terminal, disarm traps or steal an item from a target (Either through stealth or by force)."
  },
  {
    "name": "Uncanny Disguise",
    "domain": "Veil",
    "level": 1,
    "recallCost": 0,
    "category": "Ability",
    "text": "When you have a few minutes to prepare, you can mark a **Stress** to don the facade of any humanoid you can picture clearly in your mind. While disguised, all **Presence** rolls to avoid scrutiny have advantage. The disguise will begin to fade after one hour."
  },
  {
    "name": "Holo Double",
    "domain": "Veil",
    "level": 2,
    "recallCost": 1,
    "category": "Ability",
    "text": "Spend a **Hope** to summon a hologram double the same size as yourself that can move within *Far Range* from yourself.\nYou may also send it to make a simulated attack on an enemy. When you do, make a **Finesse roll** against a target within double range as if it was using your equiped weapon. On a success, roll an amount of **D4** equal to your **Finesse score** and make the target mark **Stress** the same number of the highest die result.\nYou can have only one hologram at a time."
  },
  {
    "name": "Stickybind",
    "domain": "Veil",
    "level": 2,
    "recallCost": 0,
    "category": "Ability",
    "text": "Make a Finesse Roll against all enemies within Very Close range. All it succeeds against are temporarily pinned where they are, making them temporarily Restrained."
  },
  {
    "name": "Chokehold",
    "domain": "Veil",
    "level": 3,
    "recallCost": 1,
    "category": "Ability",
    "text": "While hidden, when you successfully position yourself behind a creature that’s about your size, you can use an action to mark a **Stress** and pull them into a chokehold or equally compromising position, making them temporarily **Vulnerable**.\nEvery **Attack Roll** against them while they are Vulnerable from your chokehold adds **2D6** to the Damage roll."
  },
  {
    "name": "Mist Curtain",
    "domain": "Veil",
    "level": 3,
    "recallCost": 1,
    "category": "Ability",
    "text": "Use an action to spend a **Hope** and create a temporary thick fog that encircles a stationary area up to *Very Close* range from your current location. Everyone within is *Hidden* to anybody outside the mist."
  },
  {
    "name": "Exploit Mark",
    "domain": "Veil",
    "level": 4,
    "recallCost": 1,
    "category": "Ability",
    "text": "Make a **Finesse roll** against a target within *Very Close* range. On a sucess, spend a **Hope** to place a dark mark upon their body that exposes their weak points, temporarily reducing the target’s Difficulty number by **1 +** your **Knowledge trait**."
  },
  {
    "name": "Stealth Expertise",
    "domain": "Veil",
    "level": 4,
    "recallCost": 0,
    "category": "Ability",
    "text": "When you attempt to move through a dangerous area without being noticed, if you roll with **Fear**, you can always mark a **Stress** to change it to a roll with **Hope** instead.\nIf an ally within close range is also attempting to move without being noticed and rolls with **Fear**, you can mark a **Stress** to change their roll to a roll with **Hope** as well."
  },
  {
    "name": "Ray Wall",
    "domain": "Veil",
    "level": 5,
    "recallCost": 2,
    "category": "Ability",
    "text": "Once per *Short Rest*, you can make a **Finesse Roll (15)**. On a sucess, spend a **Hope** to place a Ray shield wall from one point within *Close* range of you, to another. The wall can be as high as **30ft (9m)**. Any creature or objects in its path are shunted to one side.\nIt will dissipate at the end of your next *Short Rest*, when you use this ability again, or when GM spend **2 Fear** to end it."
  },
  {
    "name": "Supressive Field",
    "domain": "Veil",
    "level": 5,
    "recallCost": 3,
    "category": "Ability",
    "text": "Make a **Finesse roll** against a target within *Close Range*. On a sucess, spend a **Hope** to place a supressive field emitter around the target that cover everything within *Very Close Range* of them and follows them as they move.\nThe target and anything within the area cannot use eletric related abilities and cannot deal **Energy** damage until GM spends **2 Fear** to end it, you use this Ability again, or you take **Major damage**."
  },
  {
    "name": "Mass Disguise",
    "domain": "Veil",
    "level": 6,
    "recallCost": 0,
    "category": "Ability",
    "text": "When you have a few minutes of silence to focus, you can mark a **Stress** to change the appearance of every willing target close to you, lasting for **one hour**. The new form must share a general body structure and size, and can be somebody or something you’ve seen before or entirely fabricated.\nA disguised creature’s **Presence rolls** to shrug off scrutiny have **Advantage**."
  },
  {
    "name": "Payback Mark",
    "domain": "Veil",
    "level": 6,
    "recallCost": 2,
    "category": "Ability",
    "text": "Use an action to give the GM a **Fear** and mark a *Close* enemy with a sigil. Every time that enemy does Damage to you or your allies, put a **D8** on this card up to a maximum of your Level. Any time you attack this enemy, you may choose to roll these dice and add their value to your Total Damage.\nYou can have only one active Mark at same time. Each time you place a Mark on a new being, you clear the dice on this card."
  },
  {
    "name": "Smoke Dodge",
    "domain": "Veil",
    "level": 7,
    "recallCost": 1,
    "category": "Ability",
    "text": "When you evade damage from beyond *Melee Range*, you can choose to cover yourself in smoke, becoming **Hidden** and moving to anywhere within *Close Range* of the target that attacked you. You remain **Hidden** until the next action roll you make."
  },
  {
    "name": "Veil Focus",
    "domain": "Veil",
    "level": 7,
    "recallCost": 1,
    "category": "Ability",
    "text": "When a majority of the domain cards in your Loadout are from [Veil](../Domains/Veil%207ea3c070f70244cd827b00faa74185fd.md) domain:\n- Whenever you succeed with **Fear** you gain a **Hope**.\n- If your **Fear** die ever rolls a **1** or **2**, you may reroll it once and take the new result instead."
  },
  {
    "name": "Brisk Reaction",
    "domain": "Veil",
    "level": 8,
    "recallCost": 2,
    "category": "Ability",
    "text": "Make an **Instinct Roll (14)**. On a success, you enter in an almost meditative state, with multiple deepth levels, that allows you to quick react against an attack. You may mark any number of **Stress** to dive that many of meditative level.\nWhen you have an incoming attack against you, you may roll a number of **D6** equal to how many levels deep you are in this state. If the roll result is equal to your **Agility Trait** or below, you avoid all the attack and loses one level of the meditation state. If the result is above your **Agility Trait** you take half damage and the state ends."
  },
  {
    "name": "Night Prowler",
    "domain": "Veil",
    "level": 8,
    "recallCost": 2,
    "category": "Ability",
    "text": "While you are enshrouded in low light or darkness, you gain **+1 Evasion** and all your Attack Rolls are with Advantage."
  },
  {
    "name": "Fear Toxine",
    "domain": "Veil",
    "level": 9,
    "recallCost": 2,
    "category": "Ability",
    "text": "Once per *Long rest*, use an action to choose any targets within *Very Close range*. For them, your visage changes into something of nightmarish horror. They must make a successful **Reaction Roll (16)** or become temporarily **Horrified**. While **Horrified**, they are *Vulnerable*. Steal an amount of **Fear** from the GM equal to the number of targets that are **Horrified** (or as many as they have, if it’s not enough).\nFor each **Fear** stolen, roll a **D8** and deal that much damage to each **Horrified** target.\nDiscard the stolen Fear."
  },
  {
    "name": "Prepared Strike",
    "domain": "Veil",
    "level": 9,
    "recallCost": 1,
    "category": "Ability",
    "text": "Choose a target within *Far range* to mark. Each time you succeed on any **Action Roll** against them that **doesn’t** result in making a **Damage roll**, place a token on this card.\nWhen you roll Damage against this target, you can spend any number of tokens to deal an additional **1D12** per token spent.\nYou may only hold **Prepared Strike** on one creature at a time."
  },
  {
    "name": "Envigorating Evasion",
    "domain": "Veil",
    "level": 10,
    "recallCost": 2,
    "category": "Ability",
    "text": "After you successfully evade an Attack, you may clear a **Stress**. If there is no **Stress** to clear, gain a **Hope** instead."
  },
  {
    "name": "Shroud",
    "domain": "Veil",
    "level": 10,
    "recallCost": 2,
    "category": "Ability",
    "text": "Make a **Finesse Roll (16)**. Once per *Long Rest*, on a success, plunge the entire area within *Far range* into deep shadow. Whenever you or an ally within this shadow are attacked, your Evasion is increased by +**1D6**.\nIn addition, when you or an ally rolls a successful **Attack Roll** with **Hope** against an enemy that is within this shadow, the enemy marks a **Stress**.\nThis spell lasts until the GM spends **2** **Fear**, or you take **Severe damage**."
  }
] as const

export const SKILL_SEARCH_INDEX: Readonly<Record<string, string>> =
  {
  "Bare Bones": "bare bones aegis while this card is in your loadout if you choose not to equipe armor you have an armor score equal to 4 your level",
  "Heavy Bash": "heavy bash aegis make an attack with your primary weapon in melee range on a success you deal damage push the target to very close range and may spend a hope to also make them temporarily vulnerable on a success with hope add an additional 1d6 to your damage dice on this attack",
  "I protect you": "i protect you aegis when an ally very close to you is going to take damage you may mark a stress to stand in its way and take the damage instead you may reduce the damage by spending armor slots normally if you mark a serenity reduce the damage by your strength before spending any armor slot you are also able to move and stand in the way of close allies",
  "Field Treatment": "field treatment aegis mark a stress to make a knowledge roll 13 and target yourself or a being in melee range on a success heal the target 2 hit points or 2 stress on a failure heal the target 1 hit point or 1 stress",
  "Putting the back on it": "putting the back on it aegis on a successful attack with a melee weapon always add your strength trait to your damage total",
  "Brace": "brace aegis when you use an armor slot to reduce incoming damage you may also spend any number of hope for each hope you spend reduce the incoming damage by your proficiency",
  "Feet Play": "feet play aegis a number of times equal half your proficiency rounded up per short rest when an enemy in melee range would deal damage to you you can avoid the damage entirely and safely move out of melee range of the enemy",
  "Provoke": "provoke aegis make a presence roll against a target on a success the target takes a stress and the next time they act they target you with disadvantage",
  "Refreshing Wind": "refreshing wind aegis after you finish a short rest place tokens on this card until their numbers are equal your proficiency when you successfully strike an enemy you may spend a token to clear 3 stress or 1 hit point on a success with hope you may also clear 3 stress or 1 hope of an ally within close range",
  "Armorer": "armorer aegis while you are wearing an armor and this card is in your loadout increase your armor score by 1 plus your knowledge score during a short rest if you choose to take the repair armor downtime action everybody in your party also clears one additional armor slot",
  "Conviction": "conviction aegis you speak with great power when you attempt to use this to de escalate a violent situation or get someone to follow your lead roll with advantage your willpower also emboldens you in moments of duress when all of your stress is marked your damage rolls are made with 1 proficiency",
  "Deep Fortitude": "deep fortitude aegis while this card is in your loadout increase your severe threshold by half your level rounded down if you take a minor damage below your major make a d6 roll on a proficiency result you negate the damage",
  "Inspiring Precision": "inspiring precision aegis a number of times equal half your proficiency rounded up per short rest when you roll a critical success on an attack roll you and all allies that can see or hear you may clear a 1d4 hit point or 1d4 2 stress",
  "Aegis Focus": "aegis focus aegis when a majority of the domain cards in your loadout are from aegis domains aegis 209e5ed7aad319477da8bb1ea20ca5cb0f md domain your armor score increases by 2 while this ability is in your loadout your maximum stress is increased by 1",
  "Just a Graze": "just a graze aegis when you would take damage you may mark a stress to reduce the severity of the damage by one threshold when you do roll 1d6 if the result is 2 place this card into your vault",
  "Combat Charge": "combat charge aegis after you finish a short rest place a number of tokens equal half your proficiency rounded up on top of this card you can spend a token to muster a rousing shout or phrase that inspire your allies you and all your allies that can hear you clear a stress gain a hope and take advantage on attack rolls until you or an ally fails a roll with fear",
  "Total Surge": "total surge aegis once per long rest mark 3 stress to push your body to its limits increasing all of your character traits by 2 this lasts until your next rest",
  "By a thread": "by a thread aegis when you have only one hit point remaining all of your damage thresholds are temporarily raised by 5 additionally any damage below your major threshold is ignored",
  "Hold the Line": "hold the line aegis spend 2 hope to take a defensive stance that lasts until you move or fail a roll with fear while in this stance any enemy that moves within very close range of you is immediately pulled into melee with you and can choose one of the following make a weapon attack without putting action token on action tracker against the target make the target temporarily restrained until gm spends a fear to end this condition",
  "Not Now": "not now aegis while you have this card in your loadout when you mark your last hit point instead of making a death move you may roll 1d6 and clear that many marked hit points then put this card into your vault",
  "Serenity": "serenity aegis after you successfully evade an attack you may clear a stress if you have no stress to clear instead gain a hope",
  "Elate": "elate allure make a presence roll against a target within close range on a success you can temporarily keep their attention on you once per short rest you may also mark a stress on a success to deal a stress to the target",
  "Inspirational Words": "inspirational words allure after a long rest place a number of tokens on this card equal to your presence score when you recite your words spend a token and choose an option from the list below to grant to the ally you are speaking to before the next long rest when you are without tokens you can mark a stress to refill your tokens clear a stress heal a hit point gain a hope",
  "Sharp Deceiver": "sharp deceiver allure spend a hope to take advantage on a roll you make to deceive or trick someone into believing something you tell them",
  "Dissonating Speech": "dissonating speech allure when you taunt or provoke a target within far range make a presence roll against them on a success roll a number of d4 equal to your proficiency take the highest value and deal that much stress to the target",
  "Truth Only": "truth only allure make a presence roll against a target within very close range on a success they can t lie to you while they remain within close range however they are not compelled to speak if you ask them a question and they refuse to answer they mark a stress equal to your presence score and the effect ends",
  "Sensor Overload": "sensor overload allure make an agility roll against any enemies within close range on a success spend a hope to generate a field of confusing sounds or flashing colors and lights that temporarily stun any enemies you succeed against also dealing them a stress while stunned they can t move or act until the condition is cleared",
  "Tactician": "tactician allure when you help an ally they can add one of your experience to their roll as well when making a tag team roll you can roll a d20 for your hope die instead of a d12",
  "Perspective Shift": "perspective shift allure spend a hope to make a presence roll against a target within close range on a success you can choose to confuse the target or interfere with their point of view positively moving their mood against you if they are hostile they get neutral if neutral they get friendly if you use this during combat you can choose to either stun the target or de escalate the conflict",
  "Warm Words": "warm words allure during a short rest when you use the tend to wounds downtime move on another character ou may speak supportive words to heal an extra hit point on them when you do also heal two of your own",
  "Body Reader": "body reader allure spend a hope to read the body language of a target you can see within far range to identify the most immediate intention or strategy make a instinct roll against them to gather deeper and detailed information",
  "Discord Seed": "discord seed allure you can whisper words of discord to an adversary in melee range when you do that make a presence roll 13 on a success the target immediately takes a stress and makes an attack against another enemy after the attack is over the target will realize what has happened each next use of discord seed against the same target add 5 to the roll difficulty",
  "Not Forgetting": "not forgetting allure when you mark one or more hit points from an attack you may mark a stress to place the same number of marked hit points of tokens on this card on your next attack you may clear all the tokens and increase your proficiency by the same amount if you have any tokens remaining on this card when you take a rest clear that much stress and clear the tokens",
  "Pattern Action": "pattern action allure whenever you fail an action roll your next action roll has advantage",
  "Allure Focus": "allure focus allure when a majority of the domain cards in your loadout are from allure domains allure 20a69f7686e4c24a69bf4402d229cbf472 md domain you may mark an armor slot instead of marking stress when you get a critical success on an action roll an enemy within close range takes 2 stress or an ally within close range gains 2 hope",
  "Sweet Talk": "sweet talk allure whenever you make an action roll to persuade lie deceive or garner favor you can spend a hope to reroll the hope or fear die and take the new result instead",
  "Attention Center": "attention center allure make a presence roll against all enemies within far range any you succeed against temporarily keep their attention on you narrowing their field of view and drowning out any sound but your own you also mark a stress to deal stress to all targets who are focused on you",
  "Recovery": "recovery allure during a short rest you can always choose to do one of the long rest options instead you may spend a hope to let one additional party member do the same",
  "Art Mastering": "art mastering allure when you get this card choose one or two experiences if you choose two experiences add 2 to each if you choose one experience add 3 to it then permanently put this card into your vault",
  "Leading Example": "leading example allure whenever you mark an armor slot you can roll 1d4 and choose the same number of the result of allies who can see or hear you to gain a hope or clear a stress",
  "Infamous": "infamous allure people know who you are and what you ve done and they will treat you differently because of it whenever you leverage your notoriety to get what you want mark a stress to add 10 to roll result all food and drinks for you are always free on friendly establishment and everything else you buy is reduced in price this card must remain in your loadout but doesn t count towards your domain card maximum",
  "Refreshing": "refreshing allure when you or an ally close to you has used a skill that has an exhaustion limit a number of times per rest spend any amount of hope and roll that many d6 on a 6 the exhausted feature is refueled this can t be used on any skill permanently placed in vault",
  "Lightning Reflexes": "lightning reflexes edge when you are targeted by an attack mark a stress to roll a d4 and increase your evasion against this attack by its value",
  "Nimble": "nimble edge while this card is in your loadout add half rounded up of your agility score to your evasion",
  "Sonic Shot": "sonic shot edge make a finesse roll against a target within far range on a success spend a hope to deal d8 2 physical damage using your proficiency the target also gets temporarily vulnerable",
  "Analytic Approach": "analytic approach edge after a long rest place a number of tokens equal to your knowledge trait on this card with a minimum of 1 when you make an attack roll against a target you may spend one token to choose an option below make the attack with advantage don t add an action token to action tracker for this attack add 1d8 to your damage whenever out of tokens you may mark a stress to refill your tokens as you do after a long rest when you take a long rest clear all ununsed tokens",
  "Assistent Drone": "assistent drone edge spend a hope to deploy a small droid to your side until your next short rest it takes damage or you use a reaction to deactivate it if you spend an additional hope they can be a floating droid you can communicate with it or through it with other beings you can make a finesse or knowledge roll to command it to perform simple tasks you can also mark a stress to see through its eyes besides that the droid can do the following while it s within very close range of you it can use its power source to generate a personal shield to reduce an incoming damage by your armor score plus your proficiency after that the droid will deactivate unless you spend a hope to keep its core powered you can spend an action to command it to attack a target in close of it when you do this make a finesse or knowledge attack roll against the selected target on a success deal 2d8 energy damage against the target",
  "Electric Projectile": "electric projectile edge make a finesse roll against a target within far range on a success mark a stress to deal d6 damage using your proficiency the target s difficulty value is temporarily reduced by your proficiency",
  "Thick Tether": "thick tether edge make a finesse roll against a target within far range on a success they mark a stress and are temporarily restrained if you target a flying being this brings them to the ground before restraining them",
  "Improvised Droid": "improvised droid edge spend a hope to chosse a group of objects around you and create a working small droid from them that obeys basic commands use a knowledge roll to command it to take action when necessary it shares your evasion and traits and its attacks have range up to close and deal 2d10 energy damage you can only hold one droid at a time and it falls apart when it is hit for any amount of damage",
  "Nano Medfield": "nano medfield edge once per short rest you can use an action to trigger a field of tiny healing robots around you everywhere within close range of you is covered by this small cloud of tiny floating drones causing you and your allies in the area to immediately heal one hit point you can spend a hope to increase the healing power by an additional hit point",
  "Signature Move": "signature move edge when you take this card you take on a signature move in battle that you can perform once per short rest name it and describe it when you include its description in an action you re taking use a d20 instead of a d12 as your hope die if the attack succeeds you may clear a stress",
  "Target Analysis": "target analysis edge when observing a target you can make a instinct roll against it on a success spend a hope and ask the gm for two of the mechanical specifics from below current hit points and unmarked stress difficulty evasion and damage thresholds their tactics and standard attack damage dice their moves and experiences additionally you may also mark a stress to remove one fear from the gm s pool",
  "Crippling Strike": "crippling strike edge spend a hope to make a finesse roll against a target in close range on a success you deal half of your weapon damage rounded up but making the target temporarily vulnerable",
  "Shocking Skin": "shocking skin edge once per short rest spend a hope while touching a willing being and place a number of tokens equal to your knowledge trait on this card whenever the target takes damage you can remove any number of these tokens to roll that number of d6 and add half your level rounded down to the roll reduce the incoming damage by the result and if the attacker is in melee deal the same result of energy damage back to the attacker when you take a rest clear all tokens",
  "Bustling Load": "bustling load edge once per short rest spend a hope to push your body and senses to their maximum capabilities describe how your appearance and body language change then place a d6 on this card at value of 6 while this die is active it adds its value to every action roll you make after you add its value to a roll reduce it by 1 when the die s value reaches 0 or you take a rest this state drops and you must mark an stress",
  "Edge Focus": "edge focus edge when a majority of the domain cards in your loadout are from edge domains edge 20a661e82aa5ab4ec6ba60b74c2ae81216 md domain increase your agility by 1 once per short rest you can do a finesse or agility roll using the double of the trait score",
  "Capacitor Charge": "capacitor charge edge when you should take energy damage place tokens on this card equal to the number of hit points that damage would do then reduce the incoming damage in half rounded up when you make a successful attack roll against a target you can spend any number of the tokens from this card to deal an additional 1d6 energy damage per token on your next rest clear all tokens",
  "Exposing Blow": "exposing blow edge when you make a successful attack you may mark a stress to make the next successful attack against the same target do an additional 2d12 damage",
  "Drone Nest": "drone nest edge make a finesse roll 17 on a sucess pick a spot within close range of you to put a drone nest any hostile being who moves into or starts its action within close range of the nest takes 5d10 physical damage",
  "Tech Savvy": "tech savvy edge after a long rest place on this card a number of tokens equal to how many edge cards you have in your loadout and vault whenever you would make a roll you may spend any number of these tokens to add 1 to the result before knowing the result for each used token whenever you roll a critical success on a roll using an edge card gain a token when you take a long rest clear all the tokens",
  "Adamant Armor": "adamant armor edge anytime you mark any number of armor slot roll an amount of d6 equal to the amount of armor slots you are going to mark if any result in 5 you don t have to mark that slot",
  "Harvest Strike": "harvest strike edge spend a hope and make an attack roll the gm will tell you all the enemies within your attack that it would succeed against a number of times equal half your proficiency rounded up per long rest choose one of these enemies and deal 5 hit points of damage",
  "Awareness Projection": "awareness projection essence make a forcewield roll 12 on a success once per short rest you project your perception and vigilance to a place you know within far range with radius no bigger than close range while you are concentrating you know everything that is happening in the chosen area if you are doing anything else you must make a forcewield roll 14 to perceive any activity the gm can give you advantage if the activity you are performing while projecting your awareness is simple enough",
  "Cron of Fae": "cron of fae essence telekinesis make a forcewield roll against an object or target within far range on a success you can move it anywhere within far range of its current position using the force you may mark 1 or more stress to harm the target with this movement if you do so deal 1d20 physical damage per marked stress if you are hitting a being with the target divide the damage equally between the two you can also spend a hope to take down the target and make them temporarily proned art of movement you can mark a stress to move anywhere within far range without making an agility roll also if you need to make a roll to overcome obstacles or hard terrain add your proficiency to the roll result sense surroundings spend a hope for the next 10 minutes you sense all beings within close range of you when in combat against a target within this range you overcome any disadvantage from blindness status and you are able to find anyone who is hidden using methods not related to the force if you spend an additional hope add your proficiency to your evasion until your next action",
  "Cron of Simus": "cron of simus essence each time you enter in combat or do an action that contribute to action tracker place tokens over this card until you have a number of tokens equal your proficiency blade parry spend a token from this card to use this skill when you are going to take damage from a melee range attack if you are wielding a lightsaber type weapon you can make a reaction roll 15 using your forcewield trait plus your agility score on a sucess you may spend a hope to reduce the incoming damage by the number of weapon s die sides added of your agility score bolt defense spend a token from this card to use this skill when you are going to take damage from an attack beyond melee range if you are wielding a lightsaber type weapon you can make a reaction roll 15 using your forcewield trait plus your finesse score on a sucess you may spend a hope to reduce the incoming damage by the number of weapon s die sides added of your finesse score double vision while this card is in your loadout add half of your forcewielding trait score to your evasion rounded up",
  "Cron of Fohargh": "cron of fohargh essence shelter circle place 2 action token in the action tracker to spend a hope and enter in a meditative defense stance until you mark any number of hit point or take another action you and any ally within very close range of you increase each evasion by your forcewield trait score every attack against any ally in very close range of you is done with disadvantage mynock way when you are going to make an attack roll using a lightsaber weapon you may use your knowledge as your weapon trait for the roll resilience armor use an action to spend a hope to roll 1d6 plus your forcewield score take the value and add to your armor score on the next armor slot you mark this can t be stacked if you spend a strife or mark a serenity you can mark a stress to apply this value",
  "Cron of Vaunk": "cron of vaunk essence sun djem spend a hope to make a finesse roll against a target within very close range increasing their difficulty by half their attack modifier rounded down on a success consider the target s weapon die as threshold if your damage result meet or beat this value the target is disarmed if your damage result is at least the double of target s weapon threshold consider the weapon destroyed contention maneuver when you fail a lightsaber weapon attack roll you may mark a stress to add increase your evasion by half your forcewield trait rounded up until your next attack force leap if you are doing this in a situation where the action tracker is active you must mark a stress to perform this action you can jump up to 8 times your height usually used to reach high places it can also be used to jump in other directions allowing to quick movement you don t need to spend an action token to move towards a point within far range however this skill doesn t remove the need of agility roll if applicable",
  "Cron of Draay": "cron of draay essence invigorating strike a number of times equal your proficiency between rests when you make a successful strike against an enemy you may clear 3 stress or one hit point on a success with hope you may also clear 3 stress or one hit point of an ally within close range of you if you mark a strife increase the number of cleared stress or hit point by one blurring strike when you cause an enemy to mark at least one hit point spend 2 hope to temporarily increase your evasion by the number of hit points you dealt this bonus lasts until after the next attack that targets you oblation you can make a forcewield roll 13 on a success spend a hope to clear a hit point or a stress of any target within melee range of you including yourself if you are doing this to a target other than yourself you may spend a strife or mark a serenity to mark one of your hit point to clear an extra hit point or stress for the same target",
  "Cron of Lok": "cron of lok essence contrived power confict mark a strife or spend a serenity to use this skill while this card is in your loadout everytime you roll with hope before the roll resolves you can mark a stress to make it a roll with fear when you do this choose one of the following add 3 forcewield score to your roll result add a number of d8 equal to half your proficiency rounded up to your damage roll command spend a hope to give a one word command to a creature then make a forcewield roll against target s presence roll on a sucess the target mark a stress and comply with the given command pulse wave make a forcewield roll against a number of targets up to your forcewield trait score that are within very close range each target you succeed against is blasted back to far range and take d10 physical damage using your proficiency",
  "Cron of Vrook": "cron of vrook essence hawk bat way when you are going to make a weapon attack roll with a lightsaber you can use agility trait as the weapon trait aggression aim a number of times equal to your base proficiency per short rest you can apply all your focus toward a single target choose that target until you defeat it select another target or the battle ends add 1 to your proficiency when acting against the chosen target for any other being your proficiency should be considered 1 with a minimum of 1 clench target an object or creature within far range the target stops in space unable to move exactly where it is until the end of the scene if a creature tries to move it or if it s a being that tries to move itself make a forcewield roll against them to maintain the hold each action you make while holding something contributes with 2 action tokens if you mark a strife you can mark a stress to use the force to hold the target tighter dealing 2 d8 physical damage that can t be reduced by armor slot",
  "Cron of Zez-Kai": "cron of zez kai essence redirect while wielding a lightsaber weapon when you successfully evade an attack from beyond melee range or avoid marking any hit point from it without using an armor slot you may roll a number of d6 equal to your proficiency if any roll a 6 you may mark a stress to redirect the attack against an enemy within close range of you if you mark an additional stress you can redirect the attack against the person who made it against you independent of range with advantage riposte while wielding a lightsaber weapon when you successfully evade an attack from melee range or avoid marking any hit point from it without using an armor slot you may mark a stress to perform a weapon attack roll against the opponent who attacked you without placing an action token deflective dome a number of times equal your proficiency per short rest spend a hope to completely negate any incoming damage against you if you mark a serenity you can use this to negate an incoming damage against a very close ally",
  "Cron of Othone": "cron of othone essence moderation approach when you are going to make a weapon attack roll with a lightsaber you may your forcewield trait as the weapon trait rancor way you may spend a hope to perform two attacks using one only 1 action token for this action one of them must be a weapon attack while the other must be a force related attack each attack rolls are done independently each one of them dealing only half damage rounded up if at least one of selected attacks succeed the target marks an stress besides the received damage valor spend 3 hope to charge your body with the force on the next successful weapon or body attack double your proficiency on the damage roll",
  "Cron of Rath": "cron of rath essence spark a number of times equal to your proficiency per short rest make a forcewield roll against a target within close range on a success the target must make a strength roll 18 on a failure a number of d8 equal to your forcewield trait in energy damage on a success they take half damage rounded up if you mark a strife or spend a serenity add 3d8 to the damage roll projected strike you project the force through your body to project strikes without the need of touching the target or enhancing your body movements make an unarmed attack roll against a target within very close range on a success instead of normal unarmed damage roll you roll d6 with your proficiency adding your forcewield trait to roll result you may spend hope before the damage roll to increase your proficiency by 1 for each hope spent wave blast make a forcewield roll against all enemies within melee range of you any you succeed against are hurdled into far range and dealt d8 3 physical damage using your forcewield trait",
  "Cron of Kaedan": "cron of kaedan essence assured strike whenever you make a lightsaber weapon attack roll before the roll resolves you may reduce your proficiency by 1 how many times you want as long as your proficiency for this attack don t get bellow 1 then increase the attack roll result by the same number you took from you proficiency after this attack is finished your proficiency returns to its base value vornskr ferocity any moment during a lightsaber weapon attack roll you may spend a hope to do one of the following mark a strife to increase the result of your attack or damage roll by the total strife you have spend a strife to increase the result of your attack or damage roll by the number of fear the gm has battlemind when all of your stress is marked your attacks are made with 1 proficiency",
  "Cron of Vos": "cron of vos essence echoes while touching an object you can make a forcewield roll 14 to sense the moments which the object was present on a success you get two information about moments from the object s past on a failure you get only one information you may spend a hope to focus on specific information that you try to obtain as if you were asking some question if you spend a serenity or mark a strife you may use this skill against a being you are touching to obtain the information from its memories then the target mark as many stress as the number of memories accessed foresight you can see the reality possibilities through the force once per long rest immediately after the gm conveys the consequences of your rolling with fear you may make that event your foresight you instead mark a stress and rescind the action and consequences like they never happened and choose another action instead",
  "Cron of Shan": "cron of shan essence tutaminis when you are going to take an energy damage you may mark a stress to make a forcewield roll 19 on a success you negate all the incoming energy damage from this attack on a failure you take half damage you may also on a success spend 2 hope to perform an attack against any target without using action token in case your attack hits the target add the half the damage you would receive rounded up to your damage roll result eruption pound spend 2 hope to make a forcewield roll against any enemies within very close range of you all you succeed against are thrown back to far range and must make a reaction roll 17 on a failure they also take 4d10 8 physical damage and become temporarily vulnerable on a success they don t get vulnerable and take half damage rounded up battle meditation make a forcewield roll 17 on a success once per short rest you start to emanate an invisible aura through the force affecting everyone within far range of you when you do place a d10 on this card at its highest value at any moment you and your allies can use the die value to increase the result of any roll you make or to decrease the result of any roll made against you or any of your allies then reduce the die s value by 1 the aura ends when the die reaches 0 you stop it or you get unconscious",
  "Essence Focus": "essence focus essence when a majority of the domain cards in your loadout are from essence domains essence 200900fcc63fa348229f4513fb04eb1afe md domain you can always mark a stress to add your proficiency to a forcewield roll once per short rest when incoming damage would make you to mark hit points you may choose to mark the same number of stress or spend that much of hope instead once per short rest you may replace this card with any card from your vault without paying a recall cost",
  "Cron of Kriss": "cron of kriss essence holding together once per short rest you can use an action to absorb stress from a willing creature you can touch the target describes what intimate knowledge or emotions leak from their mind in this moment between you then for each absorbed stress you choose to gain a hope or mark a serenity merging symphony when helping an ally to make a roll you may mark a stress to add one of your experiences that relates to the action also when participating on a group roll you may mark 2 stress to make all participants roll with advantage restoration after a long rest place a number of tokens equal to your forcewield trait on this card you can connect yourself with a creature within very close range and spend any number of tokens to heal them for 2 hit points per token you can also spend a token to clear a stress end the vulnerable condition or end other condition although the number or required tokens depends on the condition each spent token increases the action tracker by 1 if it s active you can mark a serenity to place new tokens until you have the same number as your forcewield trait when you take a long rest clear all remaining tokens",
  "Cron of Mann": "cron of mann essence deep empathy make a forcewield roll against the target on a success you may spend a hope to know the exact target s feeling and intent you can also do one of the following mark a serenity to estimulate calm and peaceful feelings or thoughts making the target clear as many stress as your proficiency mark a strife to confuse and disrupt target s mind making them mark a number of stress equal to your proficiency you can also mark a stress to temporarily stun the target combat meld once per long rest you may choose one spend 3 hope to initiate an extra tag team attack with an ally giving a d6 for each to add in the attack or damage roll spend 3 hope to initiate an extra tag team attack with two allies instead of one",
  "Cron of Surik": "cron of surik essence shared feature once per short rest you can spend a serenity or mark a strife to choose a trait or experience from an ally the trait score can t be higher than your forcewield trait score and the experience level must be bellow your highesr experience mark a number of stress equal half of the chosen feature rounded up and you can use it as if you had it until your next downtime period or you get unconscious bonded skill once per short rest you can choose a level 8 or lower card from another player s loadout spend a number of hope equal to half chosen card s level rounded up and this skill can mimic the features of chosen card",
  "Shatterpoint": "shatterpoint essence make a forcewield roll 16 on a success spend a hope to see through the force the key elements fractures or scars of a situation object or being the gm narrates the most important individual or item that would affect the future if used against a person you know their weakpoints and how many hit points stress and armor slots they have you may mark a stress to shatter the target throught the force dealing 3d8 plus a number of d8 equal to your forcewield trait score and are vulnerable if you are dealing damage you can also spend a serenity or mark a strife to deal an extra hit point damage",
  "Cron of Revan": "cron of revan essence something else you can concentrate for a moment using 2 action tokens if with action tracker active to make a forcewield roll 18 on a success spend 2 hope to sum up your marked strife and serenity together and redistribute the values as you will between them morichro make a forcewield roll against an organ of a target within close range you can target a vital organ if you do so increase the roll difficulty by 5 on a success spend 3 hope to stop the targeted organ dealing d10 with half your forcewield trait rouded up score of internal damage not reduced by armor slot if you spend a serenity you may add 4d10 to the damage roll unnatural power make a forcewield roll 25 on a success you may restore one creature that has been dead no longer than 50 days then roll 1d12 on a result above the sum of your proficiency and forcewield trait put this card into your vault until you spend 5 hope to unlock it on a failure this cannot be attempted again for at least a week and the consequences of failing can have unexpected effects on the dead or on you",
  "Cron of Sunrider": "cron of sunrider essence power of many once per long rest spend 5 hope to focus on one or more willing creatures that wish to be bonded until your next short rest any creatures that have this union with each other can always share hit points slots stress slots and hope slots between them severance after a long rest put on this skill a number of tokens equal to half your proficiency rounded up you can spend a token to do one of the following spend 2 hope to make a forcewield roll 23 against a force wielder target within very close range on a success spend extra 2 hope to complete the proccess and completely sever the target from their connection with the force make a forcewield roll 28 against a force wielder with their connection severed within very close range on a success spend 4 hope to restore their connection with the force their alignment shifts to half their previous value rounded down",
  "Burst Strike": "burst strike havoc when you make a successful attack using a weapon you may also spend a hope to use the same roll against every other enemy within weapon s range any additional enemies you succeed against with take half damage rounded up",
  "I want more": "i want more havoc when you roll your damage dice you may rerool any 1 or 2 once if you do you must take the new result",
  "Reprisal": "reprisal havoc when you take damage from a being in melee range you may mark a stress to immediately deal weapon damage to it at half proficiency rounded up",
  "Arms Bond": "arms bond havoc once per long rest if you compliment someone or ask them about something they are good at you may both take 3 hope",
  "Daring Presence": "daring presence havoc whenever you make a presence roll against a hostile or unfriendly target you can also add your strength trait to the roll",
  "Flame Embrace": "flame embrace havoc make an agility roll against a target within very close range on a success the target is engulfed in flames dealing 1d20 3 energy damage and temporarily catching them on fire any time a being tries to act while on fire if it is still on fire at the end of its action it must take an additional 2d6 energy damage",
  "Shifting Savagery": "shifting savagery havoc you can choose to use the character trait of your choice on an equipped weapon rather than the trait called by the weapon when dealing damage you may mark a stress to take the maximum value of one of your damage die instead of rolling it",
  "Reliable Armor": "reliable armor havoc increase your armor score by 2 while you are wearing armor and this card is in your loadout once per short rest you may use an armor slot without marking it",
  "Support Inspiration": "support inspiration havoc when an ally close to you fails a roll you may spend 2 hope to allow them to reroll either their hope or fear die and take the new result",
  "Fateful Strike": "fateful strike havoc when you land a critical hit on an attack roll choose tow of the following clear a hit point clear a marked armor slot clear a stress mark 1 hit point on the target of the attack",
  "Might": "might havoc when you take this card choose two from below then place this card into your vault permanently permanently add one additional stress slot permanently add one additional hit point slot permanently raise your damage thresholds by 2",
  "Fury": "fury havoc before making an attack roll you may mark a stress to temporarily increase your proficiency by 1 until the end of the attack",
  "Steeled": "steeled havoc while this card is in your loadout increase your proficiency and your damage thresholds by the number of scar a hope slot that is permanently crossed out you have",
  "Havoc Focus": "havoc focus havoc when a majority of the domain cards in your loadout are from havoc domains havoc 20c2a54534b4e14d359d0d9604b7aa4232 md domain attack rolls always take 2 to their result increase your severe damage threshold by 4",
  "Peripheral Hit": "peripheral hit havoc whenever you make an attack that misses its target you may mark a stress to still hit the target for weapon damage at half proficiency rounded up",
  "Harming Precision": "harming precision havoc whenever you make a successful attack with a weapon add either your finesse or agility trait to the damage",
  "Rampage": "rampage havoc you may mark 2 stress to go into a rampaged state until there are no more threats within sight while in this state you cannot use armor slots you have 2 to your proficiency and your severe damage threshold is increased by 8",
  "Great Gouge": "great gouge havoc whenever you deal enough weapon damage to defeat an enemy you can gain a hope or clear a stress when you roll a critical success on a weapon attack you gain an additional hope or clear an additional stress",
  "Staggering Presence": "staggering presence havoc presence roll 15 on a success spend 2 hope to add half your proficiency rounded up to your presence score while you have staggering presence active any adversary must always mark a stress when they target you with an attack",
  "Blazing Fighter": "blazing fighter havoc when you make a successful attack against an enemy instead of rolling for damage you may mark 5 stress to deal the target a number of hit points equal to 1d4 plus the amount of hit points you currently have marked",
  "Ravage": "ravage havoc while this card is in your loadout your successful weapon attacks always make the target to mark an extra hit point in addition increase your evasion by half your proficiency rounded up all incoming damage against you also make you mark an extra hit point",
  "Hidden Blades": "hidden blades veil spend a hope to conjure throwing blades that strike any enemies very close to you make a agility roll and all targets that you succeed against take d8 2 physical damage using your proficiency if any targets you hit are currently vulnerable they take an additional 1d8 physical damage",
  "Quick Hands": "quick hands veil you have advantage on any attempt to pick a lock unlinked to computer terminal disarm traps or steal an item from a target either through stealth or by force",
  "Uncanny Disguise": "uncanny disguise veil when you have a few minutes to prepare you can mark a stress to don the facade of any humanoid you can picture clearly in your mind while disguised all presence rolls to avoid scrutiny have advantage the disguise will begin to fade after one hour",
  "Holo Double": "holo double veil spend a hope to summon a hologram double the same size as yourself that can move within far range from yourself you may also send it to make a simulated attack on an enemy when you do make a finesse roll against a target within double range as if it was using your equiped weapon on a success roll an amount of d4 equal to your finesse score and make the target mark stress the same number of the highest die result you can have only one hologram at a time",
  "Stickybind": "stickybind veil make a finesse roll against all enemies within very close range all it succeeds against are temporarily pinned where they are making them temporarily restrained",
  "Chokehold": "chokehold veil while hidden when you successfully position yourself behind a creature that s about your size you can use an action to mark a stress and pull them into a chokehold or equally compromising position making them temporarily vulnerable every attack roll against them while they are vulnerable from your chokehold adds 2d6 to the damage roll",
  "Mist Curtain": "mist curtain veil use an action to spend a hope and create a temporary thick fog that encircles a stationary area up to very close range from your current location everyone within is hidden to anybody outside the mist",
  "Exploit Mark": "exploit mark veil make a finesse roll against a target within very close range on a sucess spend a hope to place a dark mark upon their body that exposes their weak points temporarily reducing the target s difficulty number by 1 your knowledge trait",
  "Stealth Expertise": "stealth expertise veil when you attempt to move through a dangerous area without being noticed if you roll with fear you can always mark a stress to change it to a roll with hope instead if an ally within close range is also attempting to move without being noticed and rolls with fear you can mark a stress to change their roll to a roll with hope as well",
  "Ray Wall": "ray wall veil once per short rest you can make a finesse roll 15 on a sucess spend a hope to place a ray shield wall from one point within close range of you to another the wall can be as high as 30ft 9m any creature or objects in its path are shunted to one side it will dissipate at the end of your next short rest when you use this ability again or when gm spend 2 fear to end it",
  "Supressive Field": "supressive field veil make a finesse roll against a target within close range on a sucess spend a hope to place a supressive field emitter around the target that cover everything within very close range of them and follows them as they move the target and anything within the area cannot use eletric related abilities and cannot deal energy damage until gm spends 2 fear to end it you use this ability again or you take major damage",
  "Mass Disguise": "mass disguise veil when you have a few minutes of silence to focus you can mark a stress to change the appearance of every willing target close to you lasting for one hour the new form must share a general body structure and size and can be somebody or something you ve seen before or entirely fabricated a disguised creature s presence rolls to shrug off scrutiny have advantage",
  "Payback Mark": "payback mark veil use an action to give the gm a fear and mark a close enemy with a sigil every time that enemy does damage to you or your allies put a d8 on this card up to a maximum of your level any time you attack this enemy you may choose to roll these dice and add their value to your total damage you can have only one active mark at same time each time you place a mark on a new being you clear the dice on this card",
  "Smoke Dodge": "smoke dodge veil when you evade damage from beyond melee range you can choose to cover yourself in smoke becoming hidden and moving to anywhere within close range of the target that attacked you you remain hidden until the next action roll you make",
  "Veil Focus": "veil focus veil when a majority of the domain cards in your loadout are from veil domains veil 207ea3c070f70244cd827b00faa74185fd md domain whenever you succeed with fear you gain a hope if your fear die ever rolls a 1 or 2 you may reroll it once and take the new result instead",
  "Brisk Reaction": "brisk reaction veil make an instinct roll 14 on a success you enter in an almost meditative state with multiple deepth levels that allows you to quick react against an attack you may mark any number of stress to dive that many of meditative level when you have an incoming attack against you you may roll a number of d6 equal to how many levels deep you are in this state if the roll result is equal to your agility trait or below you avoid all the attack and loses one level of the meditation state if the result is above your agility trait you take half damage and the state ends",
  "Night Prowler": "night prowler veil while you are enshrouded in low light or darkness you gain 1 evasion and all your attack rolls are with advantage",
  "Fear Toxine": "fear toxine veil once per long rest use an action to choose any targets within very close range for them your visage changes into something of nightmarish horror they must make a successful reaction roll 16 or become temporarily horrified while horrified they are vulnerable steal an amount of fear from the gm equal to the number of targets that are horrified or as many as they have if it s not enough for each fear stolen roll a d8 and deal that much damage to each horrified target discard the stolen fear",
  "Prepared Strike": "prepared strike veil choose a target within far range to mark each time you succeed on any action roll against them that doesn t result in making a damage roll place a token on this card when you roll damage against this target you can spend any number of tokens to deal an additional 1d12 per token spent you may only hold prepared strike on one creature at a time",
  "Envigorating Evasion": "envigorating evasion veil after you successfully evade an attack you may clear a stress if there is no stress to clear gain a hope instead",
  "Shroud": "shroud veil make a finesse roll 16 once per long rest on a success plunge the entire area within far range into deep shadow whenever you or an ally within this shadow are attacked your evasion is increased by 1d6 in addition when you or an ally rolls a successful attack roll with hope against an enemy that is within this shadow the enemy marks a stress this spell lasts until the gm spends 2 fear or you take severe damage"
}
