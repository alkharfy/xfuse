/**
 * Xfuse — Team Section
 * Avatar selector + card transition + vanilla-tilt + orb positions
 * Loads data from /data/team.json
 */
import { isDesktop, prefersReducedMotion } from '../core/utils.js';

// Default fallback data
let teamData = {
  ak: {
    initials: 'AK',
    nameEn: 'Ahmed Alkharfy',
    nameAr: 'أحمد الخرفي',
    roleEn: 'CEO & Lead Developer',
    roleAr: 'المدير التنفيذي والمطور الرئيسي',
    quoteEn: '"Code should solve problems, not create them."',
    quoteAr: '"الكود لازم يحل مشاكل، مش يعمل مشاكل."',
  },
};

async function loadTeamData() {
  try {
    const res = await fetch('/data/team.json');
    if (res.ok) {
      const json = await res.json();
      const members = (json.members || []).sort((a, b) => a.order - b.order);
      if (members.length) {
        teamData = {};
        members.forEach(m => {
          teamData[m.id] = {
            initials: m.initials,
            nameEn: m.nameEn,
            nameAr: m.nameAr,
            roleEn: m.roleEn,
            roleAr: m.roleAr,
            quoteEn: `"${m.quoteEn}"`,
            quoteAr: `"${m.quoteAr}"`,
            linkedin: m.linkedin || '',
            github: m.github || '',
          };
        });
        // Rebuild avatar buttons
        buildAvatarButtons(members);
      }
    }
  } catch {
    // fallback: keep default data
  }
}

function buildAvatarButtons(members) {
  const avatarsContainer = document.querySelector('.team-avatars');
  if (!avatarsContainer) return;

  avatarsContainer.innerHTML = members.map((m, i) =>
    `<button class="team-avatar${i === 0 ? ' active' : ''}" data-member="${m.id}" aria-label="${m.nameEn}" type="button">
      <span class="team-avatar__initials">${m.initials}</span>
    </button>`
  ).join('');
}

export async function initTeam() {
  const teamCard = document.querySelector('.team-card');
  const teamSection = document.querySelector('.team-section');

  if (!teamCard) return;

  // Load dynamic data
  await loadTeamData();

  const firstMemberId = Object.keys(teamData)[0];
  const avatars = document.querySelectorAll('.team-avatar');

  if (!avatars.length) return;

  // Set default active member
  updateTeamCard(firstMemberId);
  if (teamSection) teamSection.dataset.activeMember = firstMemberId;

  avatars.forEach(avatar => {
    avatar.addEventListener('click', () => {
      const member = avatar.dataset.member;
      if (!member || !teamData[member]) return;

      // Update active avatar
      avatars.forEach(a => a.classList.remove('active'));
      avatar.classList.add('active');

      // Animate card out
      teamCard.classList.add('hide-card');
      teamCard.classList.remove('show-card');

      setTimeout(() => {
        updateTeamCard(member);
        if (teamSection) teamSection.dataset.activeMember = member;

        teamCard.classList.remove('hide-card');
        teamCard.classList.add('show-card');
      }, 400);
    });
  });

  // Init vanilla-tilt on desktop only
  if (isDesktop() && !prefersReducedMotion() && typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(teamCard, {
      max: 8,
      speed: 400,
      glare: true,
      'max-glare': 0.15,
    });
  }
}

function updateTeamCard(memberId) {
  const data = teamData[memberId];
  if (!data) return;

  const card = document.querySelector('.team-card');
  if (!card) return;

  const initials = card.querySelector('.team-card__initials');
  const nameEn = card.querySelector('.team-card__name [data-lang="en"]');
  const nameAr = card.querySelector('.team-card__name [data-lang="ar"]');
  const roleEn = card.querySelector('.team-card__role [data-lang="en"]');
  const roleAr = card.querySelector('.team-card__role [data-lang="ar"]');
  const quoteEn = card.querySelector('.team-card__quote [data-lang="en"]');
  const quoteAr = card.querySelector('.team-card__quote [data-lang="ar"]');

  if (initials) initials.textContent = data.initials;
  if (nameEn) nameEn.textContent = data.nameEn;
  if (nameAr) nameAr.textContent = data.nameAr;
  if (roleEn) roleEn.textContent = data.roleEn;
  if (roleAr) roleAr.textContent = data.roleAr;
  if (quoteEn) quoteEn.textContent = data.quoteEn;
  if (quoteAr) quoteAr.textContent = data.quoteAr;
}
