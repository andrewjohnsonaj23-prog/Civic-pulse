"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../lib/supabase");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
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
        const { error: voteError } = await supabase_1.supabase
            .from('votes')
            .upsert({ issue_id: String(issue_id), user_id: String(user_id), vote }, { onConflict: 'issue_id,user_id' });
        if (voteError) {
            console.error('Vote upsert error:', voteError);
            res.status(500).json({
                success: false,
                message: 'Failed to record vote',
                error: voteError.message,
            });
            return;
        }
        const { data: counts, error: countError } = await supabase_1.supabase
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
    }
    catch (err) {
        console.error('Unexpected vote error:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message,
        });
    }
});
router.get('/:issue_id', async (req, res) => {
    const { issue_id } = req.params;
    try {
        const { data: counts, error } = await supabase_1.supabase
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
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.default = router;
