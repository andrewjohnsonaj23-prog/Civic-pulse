import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { issue_id, user_id, vote } = req.body;

  if (!issue_id || !user_id || !vote) {
    res.status(400).json({
      success: false,
      message: 'Missing required fields: issue_id, user_id, vote',
    });
    return;
  }

  if (!['yes', 'no', 'unsure'].includes(vote)) {
    res.status(400).json({
      success: false,
      message: 'Invalid vote value. Must be yes, no, or unsure',
    });
    return;
  }

  try {
    const { error: voteError } = await supabase
      .from('votes')
      .upsert(
        { issue_id: String(issue_id), user_id: String(user_id), vote },
        { onConflict: 'issue_id,user_id' }
      );

    if (voteError) {
      console.error('Vote upsert error:', voteError);
      res.status(500).json({
        success: false,
        message: 'Failed to record vote',
        error: voteError.message,
      });
      return;
    }

    const { data: counts, error: countError } = await supabase
      .from('votes')
      .select('vote')
      .eq('issue_id', String(issue_id));

    if (countError || !counts) {
      res.json({
        success: true,
        message: 'Vote recorded successfully',
        counts: null,
      });
      return;
    }

    const yes = counts.filter(v => v.vote === 'yes').length;
    const no = counts.filter(v => v.vote === 'no').length;
    const unsure = counts.filter(v => v.vote === 'unsure').length;
    const total = counts.length;

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      counts: { yes, no, unsure, total },
    });

  } catch (err: any) {
    console.error('Unexpected vote error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
});

router.get('/:issue_id', async (req: Request, res: Response) => {
  const { issue_id } = req.params;

  try {
    const { data: counts, error } = await supabase
      .from('votes')
      .select('vote')
      .eq('issue_id', issue_id);

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch votes' });
      return;
    }

    const yes = counts.filter(v => v.vote === 'yes').length;
    const no = counts.filter(v => v.vote === 'no').length;
    const unsure = counts.filter(v => v.vote === 'unsure').length;
    const total = counts.length;

    res.json({
      success: true,
      issue_id,
      counts: { yes, no, unsure, total },
    });

  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
