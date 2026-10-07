'use server';

import dbConnect from '@/lib/db/connection';
import Skill from '@/lib/db/models/skill';
import { getSession } from '@/lib/auth/session';

const XP_PER_LEVEL = 100;

export async function addXP(topic: string, amount: number) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    await dbConnect();

    // Standardize topic name slightly
    const cleanTopic = topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();

    let skill = await Skill.findOne({ userId: session.userId, topic: cleanTopic });

    if (!skill) {
      skill = new Skill({
        userId: session.userId,
        topic: cleanTopic,
        xp: 0,
        level: 1,
        unlockedPerks: [],
      });
    }

    skill.xp += amount;
    
    // Level up logic
    while (skill.xp >= skill.level * XP_PER_LEVEL) {
      skill.xp -= skill.level * XP_PER_LEVEL;
      skill.level += 1;
      
      // Auto unlock perk every 3 levels
      if (skill.level % 3 === 0) {
        skill.unlockedPerks.push(`Mastery Node ${skill.level / 3}`);
      }
    }

    await skill.save();
    return { success: true, level: skill.level, xp: skill.xp };
  } catch (error) {
    console.error('Failed to add XP:', error);
    return { success: false, error: 'Failed to add XP' };
  }
}

export async function getSkills() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    await dbConnect();
    const skills = await Skill.find({ userId: session.userId }).sort({ level: -1, xp: -1 }).lean();
    
    return { 
      success: true, 
      skills: JSON.parse(JSON.stringify(skills)) 
    };
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    return { success: false, error: 'Failed to fetch skills' };
  }
}
