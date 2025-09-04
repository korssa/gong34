"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Edit, Trash2, Save } from "lucide-react";
import { AppItem } from "@/types";
import React, { useState, useEffect } from "react";
import { blockTranslationFeedback } from "@/lib/translation-utils";


interface AdminCardActionsDialogProps {
  app: AppItem;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (app: AppItem) => void;
  onToggleFeatured?: (id: string) => void;
  onToggleEvent?: (id: string) => void;
  isFeatured?: boolean;
  isEvent?: boolean;
  onRefreshData?: () => Promise<void>; // 추가: 데이터 리로드 콜백
}

export function AdminCardActionsDialog({
  app,
  isOpen,
  onClose,
  onDelete,
  onEdit,
  onToggleFeatured,
  onToggleEvent,
  isFeatured = false,
  isEvent = false,
  onRefreshData
}: AdminCardActionsDialogProps) {
  const [localFeatured, setLocalFeatured] = useState(isFeatured);
  const [localEvent, setLocalEvent] = useState(isEvent);
  const [isSaving, setIsSaving] = useState(false);

  // props가 변경될 때마다 로컬 상태 동기화
  useEffect(() => {
    setLocalFeatured(isFeatured);
    setLocalEvent(isEvent);
  }, [isFeatured, isEvent]);

  // 해제만 가능하도록 수정 - 현재 상태가 true일 때만 false로 변경 가능
  const handleToggleFeatured = () => {
    if (localFeatured) {
      setLocalFeatured(false);
    }
  };

  const handleToggleEvent = () => {
    if (localEvent) {
      setLocalEvent(false);
    }
  };

  // 저장 버튼 클릭 시 트리거 실행 (최적화된 버전)
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      let hasChanges = false;
      
      // Featured 상태 변경이 있는 경우
      if (localFeatured !== isFeatured && onToggleFeatured) {
        await onToggleFeatured(app.id);
        hasChanges = true;
      }
      
      // Event 상태 변경이 있는 경우
      if (localEvent !== isEvent && onToggleEvent) {
        await onToggleEvent(app.id);
        hasChanges = true;
      }
      
      // 변경사항이 있는 경우에만 처리 (중복 호출 제거)
      if (hasChanges) {
        // 성공 알림
        alert('변경사항이 성공적으로 저장되었습니다.');
        
        // 다이얼로그 닫기
        onClose();
      } else {
        // 변경사항이 없으면 그냥 닫기
        onClose();
      }
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 편집 버튼 클릭
  const handleEdit = () => {
    if (onEdit) {
      onEdit(app);
      onClose();
    }
  };

  // 삭제 버튼 클릭
  const handleDelete = async () => {
    if (onDelete && confirm(`"${app.name}"을(를) 삭제하시겠습니까?`)) {
      try {
        // 삭제 실행
        onDelete(app.id);
        
        // 성공 알러트
        alert(`"${app.name}"이(가) 성공적으로 삭제되었습니다.`);
        
        // 다이얼로그 닫기
        onClose();
      } catch (error) {
        // 실패 알러트
        alert(`"${app.name}" 삭제 중 오류가 발생했습니다.`);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" onMouseEnter={blockTranslationFeedback}>
            <span>관리자 모드 - {app.name}</span>
            <Badge variant="secondary">{app.status}</Badge>
          </DialogTitle>
          <DialogDescription onMouseEnter={blockTranslationFeedback}>
            앱의 Featured 및 Event 상태를 해제하고 편집/삭제할 수 있습니다. (추가는 푸터 버튼으로만 가능)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 앱 정보 표시 */}
          <div className="p-4 bg-gray-50 rounded-lg" onMouseEnter={blockTranslationFeedback}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                📱
              </div>
              <div>
                <h3 className="font-semibold">{app.name}</h3>
                <p className="text-sm text-gray-600">{app.developer}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">{app.description}</p>
          </div>

          {/* 상태 해제 버튼들 (해제만 가능) */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={localFeatured ? "destructive" : "secondary"}
              onClick={handleToggleFeatured}
              disabled={!localFeatured}
              className={`h-12 flex flex-col items-center gap-1 ${
                localFeatured 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
              onMouseEnter={blockTranslationFeedback}
            >
              <Heart className={`h-5 w-5 ${localFeatured ? 'fill-current text-white' : 'text-gray-500'}`} />
              <span className={`text-xs ${localFeatured ? 'text-white' : 'text-gray-500'}`}>
                {localFeatured ? 'Featured 해제' : 'Featured 없음'}
              </span>
            </Button>
            
            <Button
              variant={localEvent ? "destructive" : "secondary"}
              onClick={handleToggleEvent}
              disabled={!localEvent}
              className={`h-12 flex flex-col items-center gap-1 ${
                localEvent 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
              onMouseEnter={blockTranslationFeedback}
            >
              <Star className={`h-5 w-5 ${localEvent ? 'fill-current text-white' : 'text-gray-500'}`} />
              <span className={`text-xs ${localEvent ? 'text-white' : 'text-gray-500'}`}>
                {localEvent ? 'Event 해제' : 'Event 없음'}
              </span>
            </Button>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex-1"
              onMouseEnter={blockTranslationFeedback}
            >
              <Edit className="h-4 w-4 mr-2" />
              편집
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
              onMouseEnter={blockTranslationFeedback}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </Button>
          </div>

          {/* 저장 버튼 */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700"
            onMouseEnter={blockTranslationFeedback}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '저장 중...' : '변경사항 저장'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
