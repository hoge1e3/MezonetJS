@chs_a=qw(LfoV
LfoA LfoC LfoD LfoDC LfoSync
Slur Sync
PorStart PorEnd PorLen
ECount
MCount
Resting
Steps
CurWav
L2WL
SccWave
SccCount
EShape
EVol
EBaseVol
MPoint
MPointC
ESpeed
PlayState
Detune
LfoV
LfoD
LfoDC
Oct
soundMode);
for (@chs_a) {
    $chs{$_}=1;
}
@nonCh_a=qw(
WaveDat
wdata2
PCMW
EnvDat
loopStart
PC2Time
label2Time
);
for (@nonCh_a) {
    $nonCh{$_}=1;
}

while(<>) {
    s/([\w\d]+)\s*\.\s*([\w\d]+)\s*\[([^\]]+)\]/&repl($&,$1,$2,$3)/eg;
    print;
}
sub repl{
    my ($orig,$obj, $fld , $idx)=@_;
    #print "$obj.$fld\[$idx\] : ";
    if ($nonCh{$fld}) {
        #print "nonch \n";
        return $orig;
    } elsif ($chs{$fld}) {
        #print "ch \n";
        return "$obj.channels[$idx].$fld";
    } else {
        #print "unknown \n";
        return $orig;
    }
}
